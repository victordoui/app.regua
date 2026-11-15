CREATE TABLE "public"."notification_preferences" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"               uuid                     NOT NULL,
  "system_enabled"        boolean                  DEFAULT true,
  "email_enabled"         boolean                  DEFAULT false,
  "email_address"         text,
  "whatsapp_enabled"      boolean                  DEFAULT false,
  "whatsapp_number"       text,
  "reminder_hours_before" integer                  DEFAULT 24,
  "created_at"            timestamp with time zone DEFAULT now(),
  "updated_at"            timestamp with time zone DEFAULT now(),
  "push_enabled"          boolean                  DEFAULT false,
  "push_subscription"     jsonb,
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY (id),
  CONSTRAINT "notification_preferences_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."notification_preferences"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can insert their own preferences" ON "public"."notification_preferences"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own preferences" ON "public"."notification_preferences"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own preferences" ON "public"."notification_preferences"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notification_preferences" TO "authenticated", "postgres", "service_role";
