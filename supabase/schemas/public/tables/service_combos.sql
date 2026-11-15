CREATE TABLE "public"."service_combos" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "name"           text                     NOT NULL,
  "description"    text,
  "discount_type"  text                     NOT NULL DEFAULT 'percentage'::text,
  "discount_value" numeric(10,2)            NOT NULL DEFAULT 0,
  "active"         boolean                  DEFAULT true,
  "image_url"      text,
  "created_at"     timestamp with time zone DEFAULT now(),
  "updated_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "service_combos_discount_type_check" CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text]))),
  CONSTRAINT "service_combos_pkey" PRIMARY KEY (id),
  CONSTRAINT "service_combos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."service_combos"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_service_combos_updated_at
  BEFORE UPDATE ON public.service_combos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated users can view active combos" ON "public"."service_combos"
  FOR SELECT
  TO "authenticated"
  USING ((active = true));

CREATE POLICY "Users can delete their own combos" ON "public"."service_combos"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can insert their own combos" ON "public"."service_combos"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can update their own combos" ON "public"."service_combos"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can view their own combos" ON "public"."service_combos"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."service_combos" TO "authenticated", "postgres", "service_role";
