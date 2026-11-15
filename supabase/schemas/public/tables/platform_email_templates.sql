CREATE TABLE "public"."platform_email_templates" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"          text                     NOT NULL,
  "subject"       text                     NOT NULL,
  "body_html"     text                     NOT NULL,
  "trigger_event" text,
  "active"        boolean                  DEFAULT true,
  "created_at"    timestamp with time zone DEFAULT now(),
  "updated_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "platform_email_templates_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."platform_email_templates"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_platform_email_templates_updated_at
  BEFORE UPDATE ON public.platform_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Super admins can manage email templates" ON "public"."platform_email_templates"
  FOR ALL
  TO PUBLIC
  USING (public.is_super_admin(auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_email_templates" TO "authenticated", "postgres", "service_role";
