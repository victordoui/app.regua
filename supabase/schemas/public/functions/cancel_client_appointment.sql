CREATE OR REPLACE FUNCTION public.cancel_client_appointment (
  _appointment_id uuid,
  _reason         text DEFAULT NULL::text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
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
$function$;

GRANT EXECUTE ON FUNCTION "public"."cancel_client_appointment"(uuid, text) TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."cancel_client_appointment"(uuid, text) FROM PUBLIC;
