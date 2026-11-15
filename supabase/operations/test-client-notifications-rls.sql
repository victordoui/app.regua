-- Local QA only. Creates one synthetic reminder, verifies its owner can read
-- and mark it read, then rolls every change back.
BEGIN;

DELETE FROM public.client_notifications
WHERE title = 'QA notification RLS check';

INSERT INTO public.client_notifications (
  user_id, business_user_id, appointment_id, lead_hours_before,
  title, message, action_url
)
SELECT
  cp.user_id,
  cp.barbershop_user_id,
  a.id,
  24,
  'QA notification RLS check',
  'Synthetic RLS test',
  '/b/' || cp.barbershop_user_id || '/home'
FROM public.client_profiles cp
JOIN public.appointments a
  ON a.client_id = cp.client_id
 AND a.user_id = cp.barbershop_user_id
ORDER BY a.appointment_date DESC, a.appointment_time DESC
LIMIT 1;

DO $set_claim$
DECLARE
  qa_user_id uuid;
BEGIN
  SELECT cp.user_id
  INTO qa_user_id
  FROM public.client_profiles cp
  JOIN public.appointments a
    ON a.client_id = cp.client_id
   AND a.user_id = cp.barbershop_user_id
  ORDER BY a.appointment_date DESC, a.appointment_time DESC
  LIMIT 1;

  IF qa_user_id IS NULL THEN
    RAISE EXCEPTION 'No linked local QA client is available for the RLS check';
  END IF;

  PERFORM set_config('request.jwt.claim.sub', qa_user_id::text, true);
END;
$set_claim$;

SET LOCAL ROLE authenticated;

DO $verify$
DECLARE
  visible_rows integer;
  updated_rows integer;
BEGIN
  SELECT count(*) INTO visible_rows
  FROM public.client_notifications
  WHERE title = 'QA notification RLS check';

  IF visible_rows <> 1 THEN
    RAISE EXCEPTION 'Client should read exactly its own reminder, got %', visible_rows;
  END IF;

  UPDATE public.client_notifications
  SET read_at = now()
  WHERE title = 'QA notification RLS check';
  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows <> 1 THEN
    RAISE EXCEPTION 'Client should update read_at for its reminder, got %', updated_rows;
  END IF;
END;
$verify$;

ROLLBACK;
