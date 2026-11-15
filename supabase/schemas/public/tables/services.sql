CREATE TABLE "public"."services" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "name"             text                     NOT NULL,
  "price"            numeric(10,2)            NOT NULL,
  "duration_minutes" integer                  NOT NULL,
  "description"      text,
  "active"           boolean                  NOT NULL DEFAULT true,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "image_url"        text,
  CONSTRAINT "services_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."services"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_services_user_id ON public.services USING btree (user_id);

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "services_owner_manage" ON "public"."services"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "services_public_read" ON "public"."services"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((active = true));

CREATE POLICY "services_staff_read" ON "public"."services"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = public.current_business_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."services" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."services" FROM "anon";

GRANT SELECT ON TABLE "public"."services" TO "anon";

REVOKE ALL ON TABLE "public"."services" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."services" TO "authenticated";
