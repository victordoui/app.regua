CREATE TABLE "public"."service_combo_items" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "combo_id"   uuid                     NOT NULL,
  "service_id" uuid                     NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "service_combo_items_combo_id_service_id_key" UNIQUE (combo_id, service_id),
  CONSTRAINT "service_combo_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "service_combo_items_combo_id_fkey" FOREIGN KEY (combo_id) REFERENCES public.service_combos(id) ON DELETE CASCADE,
  CONSTRAINT "service_combo_items_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

ALTER TABLE "public"."service_combo_items"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active combo items" ON "public"."service_combo_items"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.service_combos
  WHERE ((service_combos.id = service_combo_items.combo_id) AND (service_combos.active = true)))));

CREATE POLICY "Users can delete own combo items" ON "public"."service_combo_items"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.service_combos
  WHERE ((service_combos.id = service_combo_items.combo_id) AND (service_combos.user_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Users can insert own combo items" ON "public"."service_combo_items"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.service_combos
  WHERE ((service_combos.id = service_combo_items.combo_id) AND (service_combos.user_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Users can update own combo items" ON "public"."service_combo_items"
  FOR UPDATE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.service_combos
  WHERE ((service_combos.id = service_combo_items.combo_id) AND (service_combos.user_id = ( SELECT auth.uid() AS uid))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.service_combos
  WHERE ((service_combos.id = service_combo_items.combo_id) AND (service_combos.user_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Users can view own combo items" ON "public"."service_combo_items"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.service_combos
  WHERE ((service_combos.id = service_combo_items.combo_id) AND (service_combos.user_id = ( SELECT auth.uid() AS uid))))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."service_combo_items" TO "authenticated", "postgres", "service_role";
