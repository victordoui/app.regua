CREATE TABLE "public"."notification_campaigns" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "name"             text                     NOT NULL,
  "description"      text,
  "type"             text                     NOT NULL,
  "target_audience"  text                     NOT NULL,
  "channels"         text[]                   NOT NULL DEFAULT '{}'::text[],
  "template_id"      uuid,
  "custom_message"   text,
  "scheduled_date"   timestamp with time zone,
  "status"           text                     NOT NULL DEFAULT 'draft'::text,
  "recipients_count" integer                  DEFAULT 0,
  "sent_count"       integer                  DEFAULT 0,
  "failed_count"     integer                  DEFAULT 0,
  "open_rate"        numeric(5,2),
  "click_rate"       numeric(5,2),
  "created_at"       timestamp with time zone DEFAULT now(),
  "updated_at"       timestamp with time zone DEFAULT now(),
  "sent_at"          timestamp with time zone,
  CONSTRAINT "notification_campaigns_pkey" PRIMARY KEY (id),
  CONSTRAINT "notification_campaigns_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'sending'::text, 'sent'::text, 'cancelled'::text]))),
  CONSTRAINT "notification_campaigns_target_audience_check"
    CHECK ((target_audience = ANY (ARRAY['all'::text, 'subscribers'::text, 'vip'::text, 'inactive'::text, 'birthday'::text]))),
  CONSTRAINT "notification_campaigns_type_check" CHECK ((type = ANY (ARRAY['promotional'::text, 'informational'::text, 'reminder'::text]))),
  CONSTRAINT "notification_campaigns_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "notification_campaigns_template_id_fkey" FOREIGN KEY (template_id) REFERENCES public.notification_templates(id) ON DELETE SET NULL
);

ALTER TABLE "public"."notification_campaigns"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notification_campaigns_scheduled ON public.notification_campaigns USING btree (scheduled_date);

CREATE INDEX idx_notification_campaigns_status ON public.notification_campaigns USING btree (status);

CREATE INDEX idx_notification_campaigns_user_id ON public.notification_campaigns USING btree (user_id);

CREATE TRIGGER update_notification_campaigns_updated_at
  BEFORE UPDATE ON public.notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can create their own campaigns" ON "public"."notification_campaigns"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own campaigns" ON "public"."notification_campaigns"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own campaigns" ON "public"."notification_campaigns"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own campaigns" ON "public"."notification_campaigns"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notification_campaigns" TO "authenticated", "postgres", "service_role";
