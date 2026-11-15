CREATE TABLE "public"."subscription_plans" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "description" text,
  "price"       numeric(10,2)            NOT NULL,
  "features"    text[]                   DEFAULT '{}'::text[],
  "active"      boolean                  NOT NULL DEFAULT true,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."subscription_plans"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."subscription_plans"
  ADD COLUMN "billing_cycle" public.billing_cycle_type NOT NULL;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Allow admin to delete subscription plans" ON "public"."subscription_plans"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));

CREATE POLICY "Allow admin to insert subscription plans" ON "public"."subscription_plans"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));

CREATE POLICY "Allow admin to update subscription plans" ON "public"."subscription_plans"
  FOR UPDATE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));

CREATE POLICY "Allow authenticated users to view subscription plans" ON "public"."subscription_plans"
  FOR SELECT
  TO "authenticated"
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscription_plans" TO "authenticated", "postgres", "service_role";
