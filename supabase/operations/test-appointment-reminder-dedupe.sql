-- Local QA smoke only: inserts and removes one synthetic customer reminder.
DO $test$
DECLARE
  qa_user_id uuid;
  qa_business_user_id uuid;
  qa_appointment_id uuid;
  inserted_rows integer;
BEGIN
  SELECT cp.user_id, cp.barbershop_user_id, a.id
  INTO qa_user_id, qa_business_user_id, qa_appointment_id
  FROM public.client_profiles cp
  JOIN public.appointments a
    ON a.client_id = cp.client_id
   AND a.user_id = cp.barbershop_user_id
  ORDER BY a.appointment_date DESC, a.appointment_time DESC
  LIMIT 1;

  IF qa_user_id IS NULL OR qa_appointment_id IS NULL THEN
    RAISE EXCEPTION 'No linked local QA client appointment is available for the idempotency check';
  END IF;

  DELETE FROM public.client_notifications
  WHERE user_id = qa_user_id
    AND appointment_id = qa_appointment_id
    AND lead_hours_before = 24;

  INSERT INTO public.client_notifications (
    user_id, business_user_id, appointment_id, lead_hours_before,
    title, message, action_url
  )
  VALUES (
    qa_user_id, qa_business_user_id, qa_appointment_id, 24,
    'QA reminder idempotency', 'Synthetic local QA check', '/appointments'
  );
  GET DIAGNOSTICS inserted_rows = ROW_COUNT;
  IF inserted_rows <> 1 THEN
    RAISE EXCEPTION 'First reminder insert should create one row';
  END IF;

  INSERT INTO public.client_notifications (
    user_id, business_user_id, appointment_id, lead_hours_before,
    title, message, action_url
  )
  VALUES (
    qa_user_id, qa_business_user_id, qa_appointment_id, 24,
    'QA reminder idempotency duplicate', 'Synthetic local QA check', '/appointments'
  )
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted_rows = ROW_COUNT;
  IF inserted_rows <> 0 THEN
    RAISE EXCEPTION 'Duplicate reminder insert should be ignored';
  END IF;

  DELETE FROM public.client_notifications
  WHERE user_id = qa_user_id
    AND appointment_id = qa_appointment_id
    AND lead_hours_before = 24;
END;
$test$;
