CREATE TABLE "public"."platform_subscriptions" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                uuid                     NOT NULL,
  "plan_type"              text                     NOT NULL DEFAULT 'trial'::text,
  "status"                 text                     NOT NULL DEFAULT 'active'::text,
  "start_date"             timestamp with time zone DEFAULT now(),
  "end_date"               timestamp with time zone,
  "max_barbers"            integer                  DEFAULT 3,
  "max_appointments_month" integer                  DEFAULT 100,
  "features"               jsonb                    DEFAULT '{}'::jsonb,
  "notes"                  text,
  "created_at"             timestamp with time zone DEFAULT now(),
  "updated_at"             timestamp with time zone DEFAULT now(),
  "payment_status"         text                     DEFAULT 'pending'::text,
  CONSTRAINT "platform_subscriptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "platform_subscriptions_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."platform_subscriptions"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_platform_subscriptions_status ON public.platform_subscriptions USING btree (status);

CREATE INDEX idx_platform_subscriptions_user ON public.platform_subscriptions USING btree (user_id);

CREATE TRIGGER update_platform_subscriptions_updated_at
  BEFORE UPDATE ON public.platform_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "platform_subscriptions_self_read" ON "public"."platform_subscriptions"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "platform_subscriptions_super_admin_manage" ON "public"."platform_subscriptions"
  FOR ALL
  TO "authenticated"
  USING (( SELECT public.is_super_admin(( SELECT auth.uid() AS uid)) AS is_super_admin))
  WITH CHECK (( SELECT public.is_super_admin(( SELECT auth.uid() AS uid)) AS is_super_admin));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_subscriptions" TO "authenticated", "postgres", "service_role";
