CREATE TABLE "public"."appointment_services" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "appointment_id" uuid                     NOT NULL,
  "service_id"     uuid                     NOT NULL,
  "price"          numeric                  NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "appointment_services_pkey" PRIMARY KEY (id),
  CONSTRAINT "appointment_services_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE,
  CONSTRAINT "appointment_services_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id)
);

ALTER TABLE "public"."appointment_services"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."appointment_services"
  REPLICA IDENTITY FULL;

CREATE INDEX idx_appointment_services_appointment_id ON public.appointment_services USING btree (appointment_id);

CREATE INDEX idx_appointment_services_service_id ON public.appointment_services USING btree (service_id);

CREATE POLICY "appointment_services_client_read" ON "public"."appointment_services"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.appointments a
     JOIN public.client_profiles cp ON (((cp.client_id = a.client_id) AND (cp.barbershop_user_id = a.user_id))))
  WHERE ((a.id = appointment_services.appointment_id) AND (cp.user_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "appointment_services_owner_manage" ON "public"."appointment_services"
  FOR ALL
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_services.appointment_id) AND (a.user_id = ( SELECT auth.uid() AS uid))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_services.appointment_id) AND (a.user_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "appointment_services_staff_manage" ON "public"."appointment_services"
  FOR ALL
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_services.appointment_id) AND (a.user_id = public.current_business_id())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_services.appointment_id) AND (a.user_id = public.current_business_id())))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."appointment_services" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."appointment_services" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."appointment_services" TO "authenticated";
