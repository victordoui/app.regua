-- 1. Realtime
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_services REPLICA IDENTITY FULL;
ALTER TABLE public.blocked_slots REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_slots;

-- 2. Status no_show
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check
  CHECK (status = ANY (ARRAY['pending','confirmed','completed','cancelled','no_show']));

-- 3. Anti-duplicidade + performance
CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_active_slot
  ON public.appointments (user_id, barbeiro_id, appointment_date, appointment_time)
  WHERE status <> 'cancelled' AND barbeiro_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS appointments_user_date_idx ON public.appointments (user_id, appointment_date);
CREATE INDEX IF NOT EXISTS appointments_barber_date_idx ON public.appointments (barbeiro_id, appointment_date);

-- 4. updated_at
DROP TRIGGER IF EXISTS set_appointments_updated_at ON public.appointments;
CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Cancelamento pelo cliente
CREATE OR REPLACE FUNCTION public.cancel_client_appointment(_appointment_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  _actor uuid := auth.uid();
  _apt public.appointments%rowtype;
  _allow boolean;
  _hours integer;
  _starts_at timestamptz;
begin
  if _actor is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;

  select * into _apt from public.appointments where id = _appointment_id;
  if not found then raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001'; end if;

  if not exists (
    select 1 from public.client_profiles cp
    where cp.user_id = _actor
      and cp.client_id = _apt.client_id
      and cp.barbershop_user_id = _apt.user_id
  ) then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  if _apt.status = 'cancelled' then raise exception 'ALREADY_CANCELLED' using errcode = 'P0001'; end if;
  if _apt.status = 'completed' then raise exception 'ALREADY_COMPLETED' using errcode = 'P0001'; end if;

  select coalesce(allow_online_cancellation, true), coalesce(cancellation_hours_before, 24)
    into _allow, _hours
  from public.barbershop_settings where user_id = _apt.user_id;

  if not coalesce(_allow, true) then raise exception 'CANCELLATION_DISABLED' using errcode = 'P0001'; end if;

  _starts_at := (_apt.appointment_date + _apt.appointment_time) at time zone 'America/Sao_Paulo';
  if _starts_at < now() + make_interval(hours => coalesce(_hours, 24)) then
    raise exception 'TOO_LATE_TO_CANCEL' using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'cancelled',
         notes = trim(both E'\n' from coalesce(notes, '') || E'\n' ||
                 case when coalesce(trim(_reason), '') = '' then 'Cancelado pelo cliente'
                      else 'Cancelado pelo cliente: ' || trim(_reason) end)
   where id = _appointment_id;

  return jsonb_build_object('id', _appointment_id, 'status', 'cancelled');
end;
$$;

REVOKE ALL ON FUNCTION public.cancel_client_appointment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_client_appointment(uuid, text) TO authenticated;

-- 6. Remarcação pelo cliente
CREATE OR REPLACE FUNCTION public.reschedule_client_appointment(_appointment_id uuid, _date date, _time time)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  _actor uuid := auth.uid();
  _apt public.appointments%rowtype;
  _duration integer;
  _buffer integer := 0;
  _opening time;
  _closing time;
  _is_closed boolean;
begin
  if _actor is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if _date is null or _time is null then raise exception 'INVALID_DATETIME' using errcode = 'P0001'; end if;

  select * into _apt from public.appointments where id = _appointment_id;
  if not found then raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001'; end if;

  if not exists (
    select 1 from public.client_profiles cp
    where cp.user_id = _actor
      and cp.client_id = _apt.client_id
      and cp.barbershop_user_id = _apt.user_id
  ) then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  if _apt.status in ('cancelled','completed') then raise exception 'NOT_RESCHEDULABLE' using errcode = 'P0001'; end if;
  if ((_date + _time) at time zone 'America/Sao_Paulo') < now() then
    raise exception 'PAST_DATETIME' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(_apt.user_id::text || ':' || coalesce(_apt.barbeiro_id::text,'-') || ':' || _date::text, 0));

  select coalesce(buffer_minutes, 0) into _buffer from public.barbershop_settings where user_id = _apt.user_id;

  select coalesce(
    (select sum(s.duration_minutes) from public.appointment_services aps join public.services s on s.id = aps.service_id where aps.appointment_id = _apt.id),
    (select s.duration_minutes from public.services s where s.id = _apt.service_id),
    30
  ) into _duration;

  select open_time, close_time, coalesce(is_closed,false)
    into _opening, _closing, _is_closed
  from public.business_hours
  where user_id = _apt.user_id and day_of_week = extract(dow from _date);

  if coalesce(_is_closed,false) or _opening is null or _closing is null
     or _time < _opening or (_time + make_interval(mins => _duration)) > _closing then
    raise exception 'OUTSIDE_BUSINESS_HOURS' using errcode = 'P0001';
  end if;

  if _apt.barbeiro_id is not null and exists (
    select 1 from public.blocked_slots b
    where b.user_id = _apt.user_id and b.barber_id = _apt.barbeiro_id
      and b.start_datetime < ((_date + _time + make_interval(mins => _duration)) at time zone 'America/Sao_Paulo')
      and b.end_datetime > ((_date + _time) at time zone 'America/Sao_Paulo')
  ) then
    raise exception 'PROFESSIONAL_BLOCKED' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.appointments a
    where a.user_id = _apt.user_id
      and a.id <> _apt.id
      and a.barbeiro_id is not distinct from _apt.barbeiro_id
      and a.appointment_date = _date
      and a.status <> 'cancelled'
      and (a.appointment_date + a.appointment_time) < (_date + _time + make_interval(mins => (_duration + _buffer)::int))
      and (a.appointment_date + a.appointment_time + make_interval(mins => (coalesce((select sum(s.duration_minutes) from public.appointment_services aps join public.services s on s.id = aps.service_id where aps.appointment_id = a.id), (select s.duration_minutes from public.services s where s.id = a.service_id), 30) + _buffer)::int)) > (_date + _time)
  ) then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  update public.appointments
     set appointment_date = _date, appointment_time = _time
   where id = _appointment_id;

  return jsonb_build_object('id', _appointment_id, 'date', _date, 'time', to_char(_time, 'HH24:MI'));
end;
$$;

REVOKE ALL ON FUNCTION public.reschedule_client_appointment(uuid, date, time) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reschedule_client_appointment(uuid, date, time) TO authenticated;