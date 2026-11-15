CREATE TABLE "public"."notification_templates" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      uuid                     NOT NULL,
  "name"         text                     NOT NULL,
  "type"         text                     NOT NULL,
  "trigger"      text                     NOT NULL,
  "subject"      text,
  "message"      text                     NOT NULL,
  "timing_hours" integer                  NOT NULL DEFAULT 24,
  "active"       boolean                  DEFAULT true,
  "variables"    jsonb                    DEFAULT '[]'::jsonb,
  "created_at"   timestamp with time zone DEFAULT now(),
  "updated_at"   timestamp with time zone DEFAULT now(),
  CONSTRAINT "notification_templates_pkey" PRIMARY KEY (id),
  CONSTRAINT "notification_templates_trigger_check"
    CHECK
    ((trigger = ANY (ARRAY['appointment_reminder'::text, 'appointment_confirmation'::text, 'appointment_cancellation'::text, 'birthday'::text, 'promotion'::text,
    'feedback_request'::text, 'welcome'::text, 'custom'::text]))),
  CONSTRAINT "notification_templates_type_check" CHECK ((type = ANY (ARRAY['sms'::text, 'email'::text, 'whatsapp'::text, 'push'::text]))),
  CONSTRAINT "notification_templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."notification_templates"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notification_templates_active ON public.notification_templates USING btree (active);

CREATE INDEX idx_notification_templates_trigger ON public.notification_templates USING btree (TRIGGER);

CREATE INDEX idx_notification_templates_type ON public.notification_templates USING btree (TYPE);

CREATE INDEX idx_notification_templates_user_id ON public.notification_templates USING btree (user_id);

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can create their own templates" ON "public"."notification_templates"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own templates" ON "public"."notification_templates"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own templates" ON "public"."notification_templates"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own templates" ON "public"."notification_templates"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notification_templates" TO "authenticated", "postgres", "service_role";
