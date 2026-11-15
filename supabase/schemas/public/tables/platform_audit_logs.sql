CREATE TABLE "public"."platform_audit_logs" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "super_admin_id" uuid                     NOT NULL,
  "action"         text                     NOT NULL,
  "target_user_id" uuid,
  "details"        jsonb,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "platform_audit_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."platform_audit_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_platform_audit_logs_admin ON public.platform_audit_logs USING btree (super_admin_id);

CREATE POLICY "Super admins can insert audit logs" ON "public"."platform_audit_logs"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Super admins can view audit logs" ON "public"."platform_audit_logs"
  FOR SELECT
  TO PUBLIC
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_audit_logs" TO "authenticated", "postgres", "service_role";
