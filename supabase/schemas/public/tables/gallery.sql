CREATE TABLE "public"."gallery" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "barber_id"   uuid,
  "service_id"  uuid,
  "image_url"   text                     NOT NULL,
  "title"       text,
  "description" text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "gallery_pkey" PRIMARY KEY (id),
  CONSTRAINT "gallery_barber_id_fkey" FOREIGN KEY (barber_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT "gallery_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL
);

ALTER TABLE "public"."gallery"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their gallery" ON "public"."gallery"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."gallery" TO "authenticated", "postgres", "service_role";
