CREATE TABLE "public"."profiles" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "display_name"    text,
  "email"           text,
  "avatar_url"      text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "phone"           text,
  "active"          boolean                  DEFAULT true,
  "notes"           text,
  "specializations" text[]                   DEFAULT '{}'::text[],
  "auth_user_id"    uuid,
  CONSTRAINT "profiles_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles"
  ADD COLUMN "role" public.user_role DEFAULT 'cliente'::public.user_role;

CREATE INDEX idx_profiles_active ON public.profiles USING btree (active);

CREATE INDEX idx_profiles_role ON public.profiles USING btree (ROLE);

CREATE UNIQUE INDEX profiles_auth_user_id_key ON public.profiles USING btree (auth_user_id)
  WHERE (auth_user_id IS NOT NULL);

CREATE INDEX profiles_business_role_active_idx ON public.profiles USING btree (user_id, ROLE, active);

CREATE INDEX profiles_owner_active_idx ON public.profiles USING btree (user_id, active);

CREATE TRIGGER enforce_professional_plan_limit_before_write
  BEFORE INSERT OR UPDATE OF user_id, ROLE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_professional_plan_limit();

CREATE TRIGGER sync_professional_directory_after_change
  AFTER INSERT OR DELETE OR UPDATE OF user_id, display_name, avatar_url, specializations, ROLE, active ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_professional_directory();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "profiles_owner_manage" ON "public"."profiles"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "profiles_staff_read" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = public.current_business_id()));

CREATE POLICY "profiles_super_admin_read" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING (public.is_super_admin(auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."profiles" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."profiles" TO "authenticated";
