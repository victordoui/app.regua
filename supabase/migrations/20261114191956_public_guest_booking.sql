-- Allow public appointment discovery while keeping booking writes behind a
-- server-only Edge Function. The browser never receives the service key.
create table if not exists public.public_booking_rate_limits (
  id bigint generated always as identity primary key,
  business_id uuid not null,
  phone_hash text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.public_booking_rate_limits enable row level security;
revoke all on public.public_booking_rate_limits from public, anon, authenticated;
create index if not exists public_booking_rate_limits_created_at_idx
  on public.public_booking_rate_limits (created_at);
create index if not exists public_booking_rate_limits_business_phone_idx
  on public.public_booking_rate_limits (business_id, phone_hash, created_at desc);
create index if not exists public_booking_rate_limits_ip_idx
  on public.public_booking_rate_limits (ip_hash, created_at desc);

create or replace function public.consume_public_booking_rate_limit(
  _business_id uuid,
  _phone_hash text,
  _ip_hash text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  _phone_requests integer;
  _ip_requests integer;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if _business_id is null or length(_phone_hash) <> 64 or length(_ip_hash) <> 64 then
    raise exception 'INVALID_RATE_LIMIT_KEY' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('phone:' || _business_id::text || ':' || _phone_hash, 0)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ip:' || _ip_hash, 0)
  );

  delete from public.public_booking_rate_limits
  where created_at < pg_catalog.now() - interval '2 days';

  select count(*) into _phone_requests
  from public.public_booking_rate_limits
  where business_id = _business_id
    and phone_hash = _phone_hash
    and created_at > pg_catalog.now() - interval '1 hour';

  select count(*) into _ip_requests
  from public.public_booking_rate_limits
  where ip_hash = _ip_hash
    and created_at > pg_catalog.now() - interval '1 hour';

  if _phone_requests >= 5 or _ip_requests >= 20 then
    return false;
  end if;

  insert into public.public_booking_rate_limits (business_id, phone_hash, ip_hash)
  values (_business_id, _phone_hash, _ip_hash);
  return true;
end;
$$;

revoke all on function public.consume_public_booking_rate_limit(uuid, text, text) from public, anon, authenticated;
grant execute on function public.consume_public_booking_rate_limit(uuid, text, text) to service_role;

-- Availability reveals only occupied times and durations needed to generate
-- slots. It never returns customer or appointment identifiers.
create or replace function public.get_booking_availability(
  _barbershop_user_id uuid,
  _professional_id uuid,
  _date date
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.barbershop_settings
    where user_id = _barbershop_user_id and coalesce(is_public_page_enabled, false)
  ) then
    raise exception 'BUSINESS_NOT_AVAILABLE' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = _professional_id and user_id = _barbershop_user_id
      and role = 'barbeiro' and active = true
  ) then
    raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'appointments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'appointment_time', a.appointment_time,
        'duration_minutes', coalesce((
          select sum(s.duration_minutes)
          from public.appointment_services aps
          join public.services s on s.id = aps.service_id
          where aps.appointment_id = a.id
        ), (select duration_minutes from public.services where id = a.service_id), 30)
      ))
      from public.appointments a
      where a.user_id = _barbershop_user_id
        and a.barbeiro_id = _professional_id
        and a.appointment_date = _date
        and a.status <> 'cancelled'
    ), '[]'::jsonb),
    'blockedSlots', coalesce((
      select jsonb_agg(jsonb_build_object('start_datetime', b.start_datetime, 'end_datetime', b.end_datetime))
      from public.blocked_slots b
      where b.user_id = _barbershop_user_id
        and b.barber_id = _professional_id
        and b.start_datetime < ((_date + time '23:59:59') at time zone 'America/Sao_Paulo')
        and b.end_datetime > ((_date + time '00:00:00') at time zone 'America/Sao_Paulo')
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_booking_availability(uuid, uuid, date) from public;
grant execute on function public.get_booking_availability(uuid, uuid, date) to anon, authenticated;

-- The authenticated booking path stays intact. A server-side request using
-- service_role may create a guest booking after the Edge Function validates
-- the request and consumes an IP/phone rate-limit token.
create or replace function public.book_group_appointments(
  _barbershop_user_id uuid,
  _responsible jsonb,
  _participants jsonb,
  _notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  _actor uuid := auth.uid();
  _caller_role text := coalesce(auth.jwt()->>'role', '');
  _client_id uuid;
  _participant jsonb;
  _service_ids uuid[];
  _service_id uuid;
  _professional_id uuid;
  _date date;
  _time time;
  _duration integer;
  _price numeric;
  _buffer integer := 0;
  _opening time;
  _closing time;
  _is_closed boolean;
  _appointment_id uuid;
  _group_id uuid := gen_random_uuid();
  _created jsonb := '[]'::jsonb;
  _email text := lower(trim(coalesce(_responsible->>'email', '')));
  _name text := trim(coalesce(_responsible->>'name', ''));
  _phone text := regexp_replace(coalesce(_responsible->>'phone', ''), '[^0-9]', '', 'g');
begin
  if _actor is null and _caller_role <> 'service_role' then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
  if _barbershop_user_id is null or not exists (
    select 1 from public.barbershop_settings
    where user_id = _barbershop_user_id and coalesce(is_public_page_enabled, false)
  ) then
    raise exception 'BUSINESS_NOT_AVAILABLE' using errcode = 'P0001';
  end if;
  if length(_name) < 2 or length(_name) > 100 or length(_phone) not between 10 and 15 then
    raise exception 'RESPONSIBLE_REQUIRED' using errcode = 'P0001';
  end if;
  if jsonb_typeof(_participants) <> 'array' or jsonb_array_length(_participants) not between 1 and 5 then
    raise exception 'PARTICIPANTS_REQUIRED' using errcode = 'P0001';
  end if;

  select coalesce(buffer_minutes, 0) into _buffer
  from public.barbershop_settings where user_id = _barbershop_user_id;

  for _professional_id, _date in
    select distinct (p->>'professionalId')::uuid, (p->>'date')::date
    from jsonb_array_elements(_participants) p
    order by 1, 2
  loop
    perform pg_advisory_xact_lock(
      hashtextextended(_barbershop_user_id::text || ':' || _professional_id::text || ':' || _date::text, 0)
    );
  end loop;

  if _email <> '' then
    select id into _client_id from public.clients
    where user_id = _barbershop_user_id and lower(coalesce(email, '')) = _email
    limit 1 for update;
  end if;
  if _client_id is null then
    select id into _client_id from public.clients
    where user_id = _barbershop_user_id
      and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = _phone
    order by created_at asc nulls last
    limit 1 for update;
  end if;
  if _client_id is null then
    insert into public.clients(user_id, name, phone, email)
    values (_barbershop_user_id, _name, _phone, nullif(_email, ''))
    returning id into _client_id;
  else
    update public.clients
    set name = _name, phone = _phone, email = coalesce(nullif(_email, ''), email), updated_at = now()
    where id = _client_id;
  end if;

  if _actor is not null then
    insert into public.client_profiles(user_id, barbershop_user_id, client_id, full_name, phone)
    values (_actor, _barbershop_user_id, _client_id, _name, _phone)
    on conflict (user_id, barbershop_user_id) do update
    set client_id = excluded.client_id, full_name = excluded.full_name, phone = excluded.phone, updated_at = now();
  end if;

  for _participant in select value from jsonb_array_elements(_participants)
  loop
    _professional_id := (_participant->>'professionalId')::uuid;
    _date := (_participant->>'date')::date;
    _time := (_participant->>'time')::time;
    _service_ids := array(select jsonb_array_elements_text(_participant->'serviceIds')::uuid);
    if coalesce(array_length(_service_ids, 1), 0) = 0 or array_length(_service_ids, 1) > 5
      or _professional_id is null or _date is null or _time is null
      or length(trim(coalesce(_participant->>'name', ''))) not between 2 and 100 then
      raise exception 'INVALID_PARTICIPANT' using errcode = 'P0001';
    end if;
    if _date < (now() at time zone 'America/Sao_Paulo')::date
      or (_date + _time) <= (now() at time zone 'America/Sao_Paulo') then
      raise exception 'SLOT_IN_PAST' using errcode = 'P0001';
    end if;
    if not exists (
      select 1 from public.profiles p
      where p.id = _professional_id and p.user_id = _barbershop_user_id
        and p.role = 'barbeiro' and p.active = true
    ) then
      raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'P0001';
    end if;
    if (select count(*) from public.services s
        where s.id = any(_service_ids) and s.user_id = _barbershop_user_id and s.active = true)
      <> array_length(_service_ids, 1) then
      raise exception 'INVALID_SERVICE' using errcode = 'P0001';
    end if;
    select coalesce(sum(duration_minutes), 0), coalesce(sum(price), 0)
    into _duration, _price
    from public.services where id = any(_service_ids);
    _service_id := _service_ids[1];
    select open_time, close_time, coalesce(is_closed, false)
    into _opening, _closing, _is_closed
    from public.business_hours
    where user_id = _barbershop_user_id and day_of_week = extract(dow from _date);
    if coalesce(_is_closed, false) or _opening is null or _closing is null
      or _time < _opening or (_time + make_interval(mins => _duration)) > _closing then
      raise exception 'OUTSIDE_BUSINESS_HOURS' using errcode = 'P0001';
    end if;
    if exists (
      select 1 from public.blocked_slots b
      where b.user_id = _barbershop_user_id and b.barber_id = _professional_id
        and b.start_datetime < ((_date + _time + make_interval(mins => _duration)) at time zone 'America/Sao_Paulo')
        and b.end_datetime > ((_date + _time) at time zone 'America/Sao_Paulo')
    ) then
      raise exception 'PROFESSIONAL_BLOCKED' using errcode = 'P0001';
    end if;
    if exists (
      select 1 from public.appointments a
      where a.user_id = _barbershop_user_id and a.barbeiro_id = _professional_id
        and a.appointment_date = _date and a.status <> 'cancelled'
        and (a.appointment_date + a.appointment_time) < (_date + _time + make_interval(mins => (_duration + _buffer)::integer))
        and (a.appointment_date + a.appointment_time + make_interval(mins => (coalesce((
          select sum(s.duration_minutes)
          from public.appointment_services aps
          join public.services s on s.id = aps.service_id
          where aps.appointment_id = a.id
        ), (select s.duration_minutes from public.services s where s.id = a.service_id), 0) + _buffer)::integer)) > (_date + _time)
    ) then
      raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    insert into public.appointments(user_id, client_id, service_id, barbeiro_id, appointment_date, appointment_time, status, total_price, notes)
    values (_barbershop_user_id, _client_id, _service_id, _professional_id, _date, _time, 'pending', _price, coalesce(_participant->>'notes', _notes))
    returning id into _appointment_id;
    insert into public.appointment_services(appointment_id, service_id, price)
      select _appointment_id, s.id, s.price from public.services s where s.id = any(_service_ids);
    _created := _created || jsonb_build_array(jsonb_build_object(
      'id', _appointment_id, 'participant', _participant->>'name', 'date', _date,
      'time', to_char(_time, 'HH24:MI'), 'total', _price, 'groupId', _group_id
    ));
  end loop;

  return jsonb_build_object(
    'groupId', _group_id,
    'appointments', _created,
    'total', (select coalesce(sum((item->>'total')::numeric), 0) from jsonb_array_elements(_created) item)
  );
end;
$$;

revoke all on function public.book_group_appointments(uuid, jsonb, jsonb, text) from public, anon;
grant execute on function public.book_group_appointments(uuid, jsonb, jsonb, text) to authenticated, service_role;
