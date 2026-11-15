CREATE OR REPLACE FUNCTION public.save_business_appointments_with_source (
  _client_id uuid,
  _service_ids uuid[],
  _barber_id uuid,
  _appointment_dates date[],
  _appointment_time time without time zone,
  _notes text DEFAULT NULL::text,
  _recurrence_type text DEFAULT NULL::text,
  _recurrence_end_date date DEFAULT NULL::date,
  _appointment_id uuid DEFAULT NULL::uuid,
  _series_scope text DEFAULT 'single'::text,
  _booking_source text DEFAULT NULL::text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
DECLARE
  _result jsonb;
  _source text;
BEGIN
  IF _booking_source IS NOT NULL AND _booking_source NOT IN ('link', 'whatsapp', 'balcao') THEN
    RAISE EXCEPTION 'INVALID_BOOKING_SOURCE' USING ERRCODE = 'P0001';
  END IF;

  _source := coalesce(_booking_source, CASE WHEN _appointment_id IS NULL THEN 'balcao' END);
  _result := public.save_business_appointments(
    _client_id,
    _service_ids,
    _barber_id,
    _appointment_dates,
    _appointment_time,
    _notes,
    _recurrence_type,
    _recurrence_end_date,
    _appointment_id,
    _series_scope
  );

  IF _source IS NOT NULL THEN
    UPDATE public.appointments a
       SET booking_source = _source
     WHERE a.user_id = public.current_business_id()
       AND a.id IN (
         SELECT (entries.item->>'id')::uuid
         FROM jsonb_array_elements(coalesce(_result->'appointments', '[]'::jsonb)) AS entries(item)
         WHERE entries.item ? 'id'
       );
  END IF;

  RETURN _result;
END;
$function$;

REVOKE ALL ON FUNCTION public.save_business_appointments_with_source(
  uuid, uuid[], uuid, date[], time without time zone, text, text, date, uuid, text, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_business_appointments_with_source(
  uuid, uuid[], uuid, date[], time without time zone, text, text, date, uuid, text, text
) TO authenticated;
