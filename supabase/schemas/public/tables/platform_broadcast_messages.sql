CREATE TABLE "public"."platform_broadcast_messages" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"         text                     NOT NULL,
  "content"       text                     NOT NULL,
  "channel"       text                     NOT NULL,
  "target_plans"  text[],
  "target_status" text[],
  "sent_count"    integer                  DEFAULT 0,
  "sent_at"       timestamp with time zone,
  "created_by"    uuid,
  "created_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "platform_broadcast_messages_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."platform_broadcast_messages"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage broadcast messages" ON "public"."platform_broadcast_messages"
  FOR ALL
  TO PUBLIC
  USING (public.is_super_admin(auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_broadcast_messages" TO "authenticated", "postgres", "service_role";
