-- Keep every business-side appointment mutation in one database transaction.
-- This RPC intentionally runs as the caller so the existing tenant RLS remains
-- an additional authorization boundary.
create or replace function public.save_business_appointments(
  _client_id uuid,
  _service_ids uuid[],
  _barber_id uuid,
  _appointment_dates date[],
  _appointment_time time,
  _notes text default null,
  _recurrence_type text default null,
  _recurrence_end_date date default null,
  _appointment_id uuid default null,
  _series_scope text default 'single'
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  _owner uuid := auth.uid();
  _duration integer;
  _price numeric;
  _buffer integer := 0;
  _opening time;
  _closing time;
  _is_closed boolean;
  _target record;
  _target_ids uuid[] := '{}'::uuid[];
  _target_dates date[] := '{}'::date[];
  _root_id uuid;
  _current_date date;
  _saved_id uuid;
  _parent_id uuid;
  _created jsonb := '[]'::jsonb;
begin
  if _owner is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  if _client_id is null or _barber_id is null or _appointment_time is null then
    raise exception 'INVALID_APPOINTMENT' using errcode = 'P0001';
  end if;

  if coalesce(array_length(_service_ids, 1), 0) = 0
    or exists (select 1 from unnest(_service_ids) item where item is null)
    or (select count(distinct item) from unnest(_service_ids) item) <> array_length(_service_ids, 1)
  then
    raise exception 'INVALID_SERVICE' using errcode = 'P0001';
  end if;

  if _recurrence_type is not null
    and _recurrence_type not in ('weekly', 'biweekly', 'monthly')
  then
    raise exception 'INVALID_RECURRENCE' using errcode = 'P0001';
  end if;

  if _series_scope not in ('single', 'future') then
    raise exception 'INVALID_SERIES_SCOPE' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.clients c
    where c.id = _client_id and c.user_id = _owner
  ) then
    raise exception 'CLIENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = _barber_id
      and p.user_id = _owner
      and p.role = 'barbeiro'
      and p.active = true
  ) then
    raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if (
    select count(*)
    from public.services s
    where s.id = any(_service_ids)
      and s.user_id = _owner
      and s.active = true
  ) <> array_length(_service_ids, 1) then
    raise exception 'INVALID_SERVICE' using errcode = 'P0001';
  end if;

  select coalesce(sum(s.duration_minutes), 0)::integer,
         coalesce(sum(s.price), 0)
    into _duration, _price
  from public.services s
  where s.id = any(_service_ids);

  if _duration <= 0 then
    raise exception 'INVALID_SERVICE_DURATION' using errcode = 'P0001';
  end if;

  select coalesce(bs.buffer_minutes, 0)
    into _buffer
  from public.barbershop_settings bs
  where bs.user_id = _owner;

  if _appointment_id is null then
    if coalesce(array_length(_appointment_dates, 1), 0) = 0
      or exists (select 1 from unnest(_appointment_dates) item where item is null)
      or (select count(distinct item) from unnest(_appointment_dates) item) <> array_length(_appointment_dates, 1)
    then
      raise exception 'INVALID_DATETIME' using errcode = 'P0001';
    end if;

    select array_agg(item order by item)
      into _target_dates
    from unnest(_appointment_dates) item;
  else
    select coalesce(a.parent_appointment_id, a.id), a.appointment_date
      into _root_id, _current_date
    from public.appointments a
    where a.id = _appointment_id and a.user_id = _owner;

    if _root_id is null then
      raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
    end if;

    if _series_scope = 'future' then
      select array_agg(a.id order by a.appointment_date),
             array_agg(a.appointment_date order by a.appointment_date)
        into _target_ids, _target_dates
      from public.appointments a
      where a.user_id = _owner
        and (a.id = _root_id or a.parent_appointment_id = _root_id)
        and a.appointment_date >= greatest(current_date, _current_date);
    else
      _target_ids := array[_appointment_id];
      _target_dates := array[coalesce(_appointment_dates[1], _current_date)];
    end if;

    if coalesce(array_length(_target_ids, 1), 0) = 0 then
      raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  -- Locks are deterministic, so concurrent requests for the same
  -- professional/day cannot both pass availability validation.
  for _target in
    select distinct item as appointment_date
    from unnest(_target_dates) item
    order by item
  loop
    perform pg_advisory_xact_lock(
      hashtextextended(_owner::text || ':' || _barber_id::text || ':' || _target.appointment_date::text, 0)
    );
  end loop;

  for _target in
    select item as appointment_date
    from unnest(_target_dates) item
    order by item
  loop
    if ((_target.appointment_date + _appointment_time) at time zone 'America/Sao_Paulo') < now() then
      raise exception 'PAST_DATETIME' using errcode = 'P0001';
    end if;

    select bh.open_time, bh.close_time, coalesce(bh.is_closed, false)
      into _opening, _closing, _is_closed
    from public.business_hours bh
    where bh.user_id = _owner
      and bh.day_of_week = extract(dow from _target.appointment_date)::integer;

    if coalesce(_is_closed, true)
      or _opening is null
      or _closing is null
      or _appointment_time < _opening
      or (_appointment_time + make_interval(mins => _duration)) > _closing
    then
      raise exception 'OUTSIDE_BUSINESS_HOURS' using errcode = 'P0001';
    end if;

    if exists (
      select 1
      from public.blocked_slots b
      where b.user_id = _owner
        and b.barber_id = _barber_id
        and b.start_datetime < (
          (_target.appointment_date + _appointment_time + make_interval(mins => _duration))
          at time zone 'America/Sao_Paulo'
        )
        and b.end_datetime > (
          (_target.appointment_date + _appointment_time)
          at time zone 'America/Sao_Paulo'
        )
    ) then
      raise exception 'PROFESSIONAL_BLOCKED' using errcode = 'P0001';
    end if;

    if exists (
      select 1
      from public.appointments a
      where a.user_id = _owner
        and a.barbeiro_id = _barber_id
        and a.appointment_date = _target.appointment_date
        and a.status <> 'cancelled'
        and not (a.id = any(_target_ids))
        and (a.appointment_date + a.appointment_time) < (
          _target.appointment_date + _appointment_time
          + make_interval(mins => (_duration + _buffer)::integer)
        )
        and (
          a.appointment_date + a.appointment_time
          + make_interval(mins => (
            coalesce(
              (
                select sum(s.duration_minutes)
                from public.appointment_services aps
                join public.services s on s.id = aps.service_id
                where aps.appointment_id = a.id
              ),
              (select s.duration_minutes from public.services s where s.id = a.service_id),
              30
            ) + _buffer
          )::integer)
        ) > (_target.appointment_date + _appointment_time)
    ) then
      raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
    end if;
  end loop;

  if _appointment_id is null then
    foreach _current_date in array _target_dates
    loop
      insert into public.appointments(
        user_id,
        client_id,
        service_id,
        barbeiro_id,
        appointment_date,
        appointment_time,
        notes,
        status,
        total_price,
        recurrence_type,
        recurrence_end_date,
        parent_appointment_id
      ) values (
        _owner,
        _client_id,
        _service_ids[1],
        _barber_id,
        _current_date,
        _appointment_time,
        nullif(trim(coalesce(_notes, '')), ''),
        'pending',
        _price,
        _recurrence_type,
        _recurrence_end_date,
        _parent_id
      ) returning id into _saved_id;

      if _parent_id is null then
        _parent_id := _saved_id;
      end if;

      insert into public.appointment_services(appointment_id, service_id, price)
      select _saved_id, s.id, s.price
      from public.services s
      where s.id = any(_service_ids);

      _created := _created || jsonb_build_array(jsonb_build_object(
        'id', _saved_id,
        'date', _current_date,
        'time', to_char(_appointment_time, 'HH24:MI')
      ));
    end loop;
  else
    for _target in
      select ids.id, dates.appointment_date
      from unnest(_target_ids) with ordinality ids(id, position)
      join unnest(_target_dates) with ordinality dates(appointment_date, position)
        using (position)
    loop
      update public.appointments
         set client_id = _client_id,
             service_id = _service_ids[1],
             barbeiro_id = _barber_id,
             appointment_date = _target.appointment_date,
             appointment_time = _appointment_time,
             notes = nullif(trim(coalesce(_notes, '')), ''),
             total_price = _price
       where id = _target.id and user_id = _owner;

      delete from public.appointment_services aps
      where aps.appointment_id = _target.id;

      insert into public.appointment_services(appointment_id, service_id, price)
      select _target.id, s.id, s.price
      from public.services s
      where s.id = any(_service_ids);

      _created := _created || jsonb_build_array(jsonb_build_object(
        'id', _target.id,
        'date', _target.appointment_date,
        'time', to_char(_appointment_time, 'HH24:MI')
      ));
    end loop;
  end if;

  return jsonb_build_object(
    'appointments', _created,
    'totalPrice', _price,
    'durationMinutes', _duration
  );
end;
$$;

revoke all on function public.save_business_appointments(
  uuid, uuid[], uuid, date[], time, text, text, date, uuid, text
) from public, anon;
grant execute on function public.save_business_appointments(
  uuid, uuid[], uuid, date[], time, text, text, date, uuid, text
) to authenticated;
