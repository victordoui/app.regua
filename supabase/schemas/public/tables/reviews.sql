CREATE TABLE "public"."reviews" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "appointment_id" uuid,
  "client_id"      uuid,
  "barber_id"      uuid,
  "rating"         integer                  NOT NULL,
  "comment"        text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "reviews_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL,
  CONSTRAINT "reviews_barber_id_fkey" FOREIGN KEY (barber_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT "reviews_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
  CONSTRAINT "reviews_pkey" PRIMARY KEY (id),
  CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);

ALTER TABLE "public"."reviews"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert reviews" ON "public"."reviews"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can view their own reviews" ON "public"."reviews"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reviews" TO "authenticated", "postgres", "service_role";
