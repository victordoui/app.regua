CREATE TABLE "public"."email_campaigns" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "subject"          text                     NOT NULL,
  "content"          text                     NOT NULL,
  "target_segment"   text                     DEFAULT 'all'::text,
  "scheduled_at"     timestamp with time zone,
  "sent_at"          timestamp with time zone,
  "recipients_count" integer                  DEFAULT 0,
  "status"           text                     DEFAULT 'draft'::text,
  "created_at"       timestamp with time zone DEFAULT now(),
  CONSTRAINT "email_campaigns_pkey" PRIMARY KEY (id),
  CONSTRAINT "email_campaigns_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'sent'::text, 'failed'::text])))
);

ALTER TABLE "public"."email_campaigns"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their campaigns" ON "public"."email_campaigns"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."email_campaigns" TO "authenticated", "postgres", "service_role";
