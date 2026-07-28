-- Aggregate service durations are bigint; PostgreSQL interval construction needs integer minutes.
create or replace function public.book_group_appointments(
  _barbershop_user_id uuid,
  _responsible jsonb,
  _participants jsonb,
  _notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _actor uuid := auth.uid();
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
  if _actor is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if _barbershop_user_id is null or not exists (select 1 from public.barbershop_settings where user_id = _barbershop_user_id) then
    raise exception 'BUSINESS_NOT_FOUND' using errcode = 'P0001';
  end if;
  if _name = '' or _email = '' or _phone = '' then raise exception 'RESPONSIBLE_REQUIRED' using errcode = 'P0001'; end if;
  if jsonb_typeof(_participants) <> 'array' or jsonb_array_length(_participants) = 0 then raise exception 'PARTICIPANTS_REQUIRED' using errcode = 'P0001'; end if;

  select coalesce(buffer_minutes, 0) into _buffer from public.barbershop_settings where user_id = _barbershop_user_id;

  -- Deterministic transaction locks prevent a race for the same professional/day.
  for _professional_id, _date in
    select distinct (p->>'professionalId')::uuid, (p->>'date')::date
    from jsonb_array_elements(_participants) p
    order by 1, 2
  loop
    perform pg_advisory_xact_lock(hashtextextended(_barbershop_user_id::text || ':' || _professional_id::text || ':' || _date::text, 0));
  end loop;

  select id into _client_id from public.clients where user_id = _barbershop_user_id and lower(coalesce(email,'')) = _email limit 1;
  if _client_id is null then
    insert into public.clients(user_id, name, phone, email) values (_barbershop_user_id, _name, _phone, _email) returning id into _client_id;
  else
    update public.clients set name = _name, phone = _phone, updated_at = now() where id = _client_id;
  end if;

  insert into public.client_profiles(user_id, barbershop_user_id, client_id, full_name, phone)
  values (_actor, _barbershop_user_id, _client_id, _name, _phone)
  on conflict (user_id, barbershop_user_id) do update
  set client_id = excluded.client_id, full_name = excluded.full_name, phone = excluded.phone, updated_at = now();

  for _participant in select value from jsonb_array_elements(_participants)
  loop
    _professional_id := (_participant->>'professionalId')::uuid;
    _date := (_participant->>'date')::date;
    _time := (_participant->>'time')::time;
    _service_ids := array(select jsonb_array_elements_text(_participant->'serviceIds')::uuid);
    if coalesce(array_length(_service_ids, 1), 0) = 0 or _professional_id is null or _date is null or _time is null or trim(coalesce(_participant->>'name','')) = '' then
      raise exception 'INVALID_PARTICIPANT' using errcode = 'P0001';
    end if;
    if not exists (select 1 from public.profiles p where p.id = _professional_id and p.user_id = _barbershop_user_id and p.role = 'barbeiro' and p.active = true) then
      raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'P0001';
    end if;
    if (select count(*) from public.services s where s.id = any(_service_ids) and s.user_id = _barbershop_user_id and s.active = true) <> array_length(_service_ids, 1) then
      raise exception 'INVALID_SERVICE' using errcode = 'P0001';
    end if;
    select coalesce(sum(duration_minutes),0), coalesce(sum(price),0) into _duration, _price from public.services where id = any(_service_ids);
    _service_id := _service_ids[1];
    select open_time, close_time, coalesce(is_closed,false) into _opening, _closing, _is_closed from public.business_hours where user_id = _barbershop_user_id and day_of_week = extract(dow from _date);
    if coalesce(_is_closed,false) or _opening is null or _closing is null or _time < _opening or (_time + make_interval(mins => _duration)) > _closing then
      raise exception 'OUTSIDE_BUSINESS_HOURS' using errcode = 'P0001';
    end if;
    if exists (
      select 1 from public.blocked_slots b
      where b.user_id = _barbershop_user_id and b.barber_id = _professional_id
        and b.start_datetime < ((_date + _time + make_interval(mins => _duration)) at time zone 'America/Sao_Paulo')
        and b.end_datetime > ((_date + _time) at time zone 'America/Sao_Paulo')
    ) then raise exception 'PROFESSIONAL_BLOCKED' using errcode = 'P0001'; end if;
    if exists (
      select 1 from public.appointments a
      where a.user_id = _barbershop_user_id and a.barbeiro_id = _professional_id and a.appointment_date = _date and a.status <> 'cancelled'
        and (a.appointment_date + a.appointment_time) < (_date + _time + make_interval(mins => (_duration + _buffer)::int))
        and (a.appointment_date + a.appointment_time + make_interval(mins => (coalesce((select sum(s.duration_minutes) from public.appointment_services aps join public.services s on s.id = aps.service_id where aps.appointment_id = a.id), (select s.duration_minutes from public.services s where s.id = a.service_id), 0) + _buffer)::int)) > (_date + _time)
    ) then raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001'; end if;

    insert into public.appointments(user_id, client_id, service_id, barbeiro_id, appointment_date, appointment_time, status, total_price, notes)
    values (_barbershop_user_id, _client_id, _service_id, _professional_id, _date, _time, 'pending', _price, coalesce(_participant->>'notes', _notes))
    returning id into _appointment_id;
    insert into public.appointment_services(appointment_id, service_id, price)
      select _appointment_id, s.id, s.price from public.services s where s.id = any(_service_ids);
    _created := _created || jsonb_build_array(jsonb_build_object('id',_appointment_id,'participant',_participant->>'name','date',_date,'time',to_char(_time,'HH24:MI'),'total',_price,'groupId',_group_id));
  end loop;
  return jsonb_build_object('groupId', _group_id, 'appointments', _created, 'total', (select coalesce(sum((item->>'total')::numeric),0) from jsonb_array_elements(_created) item));
end;
$$;


revoke all on function public.book_group_appointments(uuid, jsonb, jsonb, text) from public, anon;
grant execute on function public.book_group_appointments(uuid, jsonb, jsonb, text) to authenticated;
