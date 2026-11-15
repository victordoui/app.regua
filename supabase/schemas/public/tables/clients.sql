CREATE TABLE "public"."clients" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"       uuid                     NOT NULL,
  "name"          text                     NOT NULL,
  "phone"         text                     NOT NULL,
  "email"         text,
  "notes"         text,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "referral_code" text,
  "birth_date"    date,
  CONSTRAINT "clients_pkey" PRIMARY KEY (id),
  CONSTRAINT "clients_referral_code_key" UNIQUE (referral_code)
);

ALTER TABLE "public"."clients"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_clients_user_id ON public.clients USING btree (user_id);

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "clients_client_read" ON "public"."clients"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.client_profiles cp
  WHERE ((cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.client_id = clients.id) AND (cp.barbershop_user_id = clients.user_id)))));

CREATE POLICY "clients_owner_manage" ON "public"."clients"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "clients_staff_manage" ON "public"."clients"
  FOR ALL
  TO "authenticated"
  USING ((user_id = public.current_business_id()))
  WITH CHECK ((user_id = public.current_business_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."clients" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."clients" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."clients" TO "authenticated";
