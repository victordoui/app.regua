CREATE TABLE "public"."notification_logs" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"       uuid                     NOT NULL,
  "client_id"     uuid,
  "campaign_id"   uuid,
  "template_id"   uuid,
  "channel"       text                     NOT NULL,
  "recipient"     text                     NOT NULL,
  "subject"       text,
  "message"       text                     NOT NULL,
  "status"        text                     NOT NULL DEFAULT 'pending'::text,
  "error_message" text,
  "metadata"      jsonb                    DEFAULT '{}'::jsonb,
  "created_at"    timestamp with time zone DEFAULT now(),
  "delivered_at"  timestamp with time zone,
  "read_at"       timestamp with time zone,
  CONSTRAINT "notification_logs_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.notification_campaigns(id) ON DELETE SET NULL,
  CONSTRAINT "notification_logs_channel_check" CHECK ((channel = ANY (ARRAY['sms'::text, 'email'::text, 'whatsapp'::text, 'push'::text, 'system'::text]))),
  CONSTRAINT "notification_logs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
  CONSTRAINT "notification_logs_pkey" PRIMARY KEY (id),
  CONSTRAINT "notification_logs_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'failed'::text, 'bounced'::text]))),
  CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "notification_logs_template_id_fkey" FOREIGN KEY (template_id) REFERENCES public.notification_templates(id) ON DELETE SET NULL
);

ALTER TABLE "public"."notification_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notification_logs_campaign_id ON public.notification_logs USING btree (campaign_id);

CREATE INDEX idx_notification_logs_channel ON public.notification_logs USING btree (channel);

CREATE INDEX idx_notification_logs_client_id ON public.notification_logs USING btree (client_id);

CREATE INDEX idx_notification_logs_created_at ON public.notification_logs USING btree (created_at);

CREATE INDEX idx_notification_logs_status ON public.notification_logs USING btree (status);

CREATE INDEX idx_notification_logs_user_id ON public.notification_logs USING btree (user_id);

CREATE POLICY "Users can create their own logs" ON "public"."notification_logs"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own logs" ON "public"."notification_logs"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notification_logs" TO "authenticated", "postgres", "service_role";
