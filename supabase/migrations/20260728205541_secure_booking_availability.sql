-- Return only availability metadata; appointments and blocks themselves remain private.
create or replace function public.get_booking_availability(
  _barbershop_user_id uuid,
  _professional_id uuid,
  _date date
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
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

revoke all on function public.get_booking_availability(uuid, uuid, date) from public, anon;
grant execute on function public.get_booking_availability(uuid, uuid, date) to authenticated;
