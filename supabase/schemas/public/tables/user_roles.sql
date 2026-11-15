CREATE TABLE "public"."user_roles" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"            uuid                     NOT NULL,
  "barbershop_user_id" uuid,
  "created_at"         timestamp with time zone DEFAULT now(),
  "profile_id"         uuid,
  CONSTRAINT "user_roles_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_roles_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."user_roles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_roles"
  ADD COLUMN "role" public.app_role NOT NULL;

ALTER TABLE "public"."user_roles"
  ADD CONSTRAINT "user_roles_user_id_role_barbershop_user_id_key" UNIQUE (user_id, ROLE, barbershop_user_id);

ALTER TABLE "public"."user_roles"
  ADD CONSTRAINT "user_roles_user_id_role_unique" UNIQUE (user_id, ROLE);

CREATE INDEX idx_user_roles_profile_id ON public.user_roles USING btree (profile_id);

CREATE POLICY "user_roles_business_admin_manage" ON "public"."user_roles"
  FOR ALL
  TO "authenticated"
  USING (((ROLE <> 'super_admin'::public.app_role) AND (profile_id IS NOT NULL) AND ( SELECT public.is_current_user_admin() AS is_current_user_admin) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = user_roles.profile_id) AND (p.user_id = ( SELECT auth.uid() AS uid)))))))
  WITH CHECK (((role <> 'super_admin'::public.app_role) AND (profile_id IS NOT NULL) AND ( SELECT public.is_current_user_admin() AS is_current_user_admin) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = user_roles.profile_id) AND (p.user_id = ( SELECT auth.uid() AS uid)))))));

CREATE POLICY "user_roles_self_read" ON "public"."user_roles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "user_roles_super_admin_manage" ON "public"."user_roles"
  FOR ALL
  TO "authenticated"
  USING (( SELECT public.is_super_admin(( SELECT auth.uid() AS uid)) AS is_super_admin))
  WITH CHECK (( SELECT public.is_super_admin(( SELECT auth.uid() AS uid)) AS is_super_admin));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_roles" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."user_roles" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."user_roles" TO "authenticated";
