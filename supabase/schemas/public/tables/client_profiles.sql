CREATE TABLE "public"."client_profiles" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"            uuid                     NOT NULL,
  "barbershop_user_id" uuid                     NOT NULL,
  "full_name"          text                     NOT NULL,
  "phone"              text,
  "cpf"                text,
  "birth_date"         date,
  "avatar_url"         text,
  "address_cep"        text,
  "address_street"     text,
  "address_number"     text,
  "address_city"       text,
  "address_state"      text,
  "created_at"         timestamp with time zone DEFAULT now(),
  "updated_at"         timestamp with time zone DEFAULT now(),
  "client_id"          uuid,
  CONSTRAINT "client_profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "client_profiles_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL
);

ALTER TABLE "public"."client_profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX client_profiles_client_business_unique ON public.client_profiles USING btree (client_id, barbershop_user_id)
  WHERE (client_id IS NOT NULL);

CREATE UNIQUE INDEX client_profiles_user_business_unique ON public.client_profiles USING btree (user_id, barbershop_user_id);

CREATE INDEX idx_client_profiles_client_id ON public.client_profiles USING btree (client_id);

CREATE TRIGGER on_client_profile_created
  AFTER INSERT ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_client_profile();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER validate_client_profile_link_trigger
  BEFORE INSERT OR UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_client_profile_link();

CREATE POLICY "client_profiles_owner_delete" ON "public"."client_profiles"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = barbershop_user_id));

CREATE POLICY "client_profiles_owner_read" ON "public"."client_profiles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = barbershop_user_id));

CREATE POLICY "client_profiles_owner_update" ON "public"."client_profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = barbershop_user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = barbershop_user_id));

CREATE POLICY "client_profiles_self_insert" ON "public"."client_profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (client_id IS NULL)));

CREATE POLICY "client_profiles_self_read" ON "public"."client_profiles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "client_profiles_self_update" ON "public"."client_profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "client_profiles_staff_read" ON "public"."client_profiles"
  FOR SELECT
  TO "authenticated"
  USING ((barbershop_user_id = public.current_business_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_profiles" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."client_profiles" FROM "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."client_profiles" TO "authenticated";
