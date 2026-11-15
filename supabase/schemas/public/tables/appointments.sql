CREATE TABLE "public"."appointments" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"               uuid                     NOT NULL,
  "client_id"             uuid                     NOT NULL,
  "service_id"            uuid                     NOT NULL,
  "appointment_date"      date                     NOT NULL,
  "appointment_time"      time without time zone   NOT NULL,
  "status"                text                     NOT NULL DEFAULT 'pending'::text,
  "notes"                 text,
  "total_price"           numeric(10,2),
  "barbeiro_id"           uuid,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "recurrence_type"       text,
  "recurrence_end_date"   date,
  "parent_appointment_id" uuid,
  "reminder_sent_at"      timestamp with time zone,
  "result_photo_url"      text,
  "booking_source"        text                     DEFAULT 'balcao'::text,
  CONSTRAINT "appointments_pkey" PRIMARY KEY (id),
  CONSTRAINT "appointments_parent_appointment_id_fkey" FOREIGN KEY (parent_appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL,
  CONSTRAINT "appointments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text]))),
  CONSTRAINT "appointments_booking_source_check" CHECK ((booking_source IS NULL OR booking_source = ANY (ARRAY['link'::text, 'whatsapp'::text, 'balcao'::text]))),
  CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
  CONSTRAINT "appointments_barbeiro_id_fkey" FOREIGN KEY (barbeiro_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

ALTER TABLE "public"."appointments"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."appointments"
  REPLICA IDENTITY FULL;

CREATE INDEX appointments_barber_date_idx ON public.appointments USING btree (barbeiro_id, appointment_date);

CREATE UNIQUE INDEX appointments_unique_active_slot ON public.appointments USING btree (user_id, barbeiro_id, appointment_date, appointment_time)
  WHERE ((status <> 'cancelled'::text) AND (barbeiro_id IS NOT NULL));

CREATE INDEX appointments_user_date_idx ON public.appointments USING btree (user_id, appointment_date);

CREATE INDEX idx_appointments_barbeiro_id ON public.appointments USING btree (barbeiro_id);

CREATE INDEX idx_appointments_barber_date_active ON public.appointments USING btree (barbeiro_id, appointment_date)
  WHERE (status <> 'cancelled'::text);

CREATE INDEX idx_appointments_client_id ON public.appointments USING btree (client_id);

CREATE INDEX idx_appointments_parent_id ON public.appointments USING btree (parent_appointment_id);

CREATE INDEX idx_appointments_reminder ON public.appointments USING btree (appointment_date, reminder_sent_at)
  WHERE (reminder_sent_at IS NULL);

CREATE INDEX idx_appointments_service_id ON public.appointments USING btree (service_id);

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "appointments_client_read" ON "public"."appointments"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.client_profiles cp
  WHERE ((cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.client_id = appointments.client_id) AND (cp.barbershop_user_id = appointments.user_id)))));

CREATE POLICY "appointments_owner_manage" ON "public"."appointments"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "appointments_staff_manage" ON "public"."appointments"
  FOR ALL
  TO "authenticated"
  USING ((user_id = public.current_business_id()))
  WITH CHECK ((user_id = public.current_business_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."appointments" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."appointments" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."appointments" TO "authenticated";
