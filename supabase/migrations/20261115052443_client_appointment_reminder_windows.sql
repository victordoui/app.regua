-- Keep the 24-hour and 2-hour client reminder deliveries independent.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_2h_sent_at timestamptz;

-- Preserve the legacy delivery marker as an already-sent 24-hour reminder.
UPDATE public.appointments
SET reminder_24h_sent_at = reminder_sent_at
WHERE reminder_24h_sent_at IS NULL
  AND reminder_sent_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_client_reminder_windows
  ON public.appointments (appointment_date, status)
  WHERE reminder_24h_sent_at IS NULL OR reminder_2h_sent_at IS NULL;

-- Client accounts do not have rows in public.profiles, which is the legacy
-- notifications table recipient FK. Keep customer reminders in an auth-owned table.
DROP INDEX IF EXISTS public.idx_notifications_appointment_reminder_dedupe;

CREATE TABLE IF NOT EXISTS public.client_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  lead_hours_before smallint NOT NULL CHECK (lead_hours_before IN (24, 2)),
  title text NOT NULL,
  message text NOT NULL,
  action_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT client_notifications_reminder_unique
    UNIQUE (user_id, appointment_id, lead_hours_before)
);

CREATE INDEX IF NOT EXISTS idx_client_notifications_unread
  ON public.client_notifications (user_id, business_user_id, created_at DESC)
  WHERE read_at IS NULL;

ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.client_notifications FROM anon, authenticated;
GRANT SELECT ON public.client_notifications TO authenticated;
GRANT UPDATE (read_at) ON public.client_notifications TO authenticated;
GRANT ALL ON public.client_notifications TO service_role;

CREATE POLICY client_notifications_read_own
  ON public.client_notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY client_notifications_mark_own_read
  ON public.client_notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
