CREATE TABLE "public"."platform_support_tickets" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "subject"     text                     NOT NULL,
  "description" text                     NOT NULL,
  "status"      text                     DEFAULT 'open'::text,
  "priority"    text                     DEFAULT 'normal'::text,
  "assigned_to" uuid,
  "resolved_at" timestamp with time zone,
  "created_at"  timestamp with time zone DEFAULT now(),
  "updated_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "platform_support_tickets_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."platform_support_tickets"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_platform_support_tickets_updated_at
  BEFORE UPDATE ON public.platform_support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Super admins can manage all tickets" ON "public"."platform_support_tickets"
  FOR ALL
  TO PUBLIC
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can create their own tickets" ON "public"."platform_support_tickets"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own tickets" ON "public"."platform_support_tickets"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_support_tickets" TO "authenticated", "postgres", "service_role";
