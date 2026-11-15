CREATE TABLE "public"."platform_plan_config" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "plan_type"              text                     NOT NULL,
  "display_name"           text                     NOT NULL,
  "price_monthly"          numeric                  NOT NULL DEFAULT 0,
  "price_yearly"           numeric,
  "max_barbers"            integer                  NOT NULL DEFAULT 3,
  "max_appointments_month" integer                  NOT NULL DEFAULT 100,
  "features"               jsonb                    DEFAULT '{}'::jsonb,
  "is_active"              boolean                  DEFAULT true,
  "sort_order"             integer                  DEFAULT 0,
  "created_at"             timestamp with time zone DEFAULT now(),
  "updated_at"             timestamp with time zone DEFAULT now(),
  "trial_days"             integer                  DEFAULT 14,
  "stripe_price_id"        text,
  "stripe_price_yearly_id" text,
  CONSTRAINT "platform_plan_config_pkey" PRIMARY KEY (id),
  CONSTRAINT "platform_plan_config_plan_type_key" UNIQUE (plan_type)
);

ALTER TABLE "public"."platform_plan_config"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_platform_plan_config_updated_at
  BEFORE UPDATE ON public.platform_plan_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can read active plan configs" ON "public"."platform_plan_config"
  FOR SELECT
  TO PUBLIC
  USING ((is_active = true));

CREATE POLICY "Super admins can manage plan configs" ON "public"."platform_plan_config"
  FOR ALL
  TO "authenticated"
  USING (( SELECT public.is_super_admin(( SELECT auth.uid() AS uid)) AS is_super_admin))
  WITH CHECK (( SELECT public.is_super_admin(( SELECT auth.uid() AS uid)) AS is_super_admin));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_plan_config" TO "authenticated", "postgres", "service_role";

REVOKE ALL ON TABLE "public"."platform_plan_config" FROM "anon";

GRANT SELECT ON TABLE "public"."platform_plan_config" TO "anon";
