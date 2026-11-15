CREATE TABLE "public"."favorite_barbers" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "client_profile_id"  uuid                     NOT NULL,
  "barber_id"          uuid                     NOT NULL,
  "barbershop_user_id" uuid                     NOT NULL,
  "created_at"         timestamp with time zone DEFAULT now(),
  CONSTRAINT "favorite_barbers_client_profile_id_barber_id_key" UNIQUE (client_profile_id, barber_id),
  CONSTRAINT "favorite_barbers_client_profile_id_fkey" FOREIGN KEY (client_profile_id) REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  CONSTRAINT "favorite_barbers_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."favorite_barbers"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favorites" ON "public"."favorite_barbers"
  FOR ALL
  TO PUBLIC
  USING ((client_profile_id IN ( SELECT client_profiles.id
   FROM public.client_profiles
  WHERE (client_profiles.user_id = auth.uid()))));

CREATE POLICY "Users can view their favorites" ON "public"."favorite_barbers"
  FOR SELECT
  TO PUBLIC
  USING ((client_profile_id IN ( SELECT client_profiles.id
   FROM public.client_profiles
  WHERE (client_profiles.user_id = auth.uid()))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."favorite_barbers" TO "authenticated", "postgres", "service_role";
