CREATE TABLE "public"."waitlist" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"              uuid                     NOT NULL,
  "client_id"            uuid,
  "client_name"          text                     NOT NULL,
  "client_phone"         text                     NOT NULL,
  "service_id"           uuid,
  "barber_id"            uuid,
  "preferred_date"       date,
  "preferred_time_start" time without time zone,
  "preferred_time_end"   time without time zone,
  "status"               text                     NOT NULL DEFAULT 'waiting'::text,
  "notified_at"          timestamp with time zone,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "waitlist_barber_id_fkey" FOREIGN KEY (barber_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT "waitlist_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
  CONSTRAINT "waitlist_pkey" PRIMARY KEY (id),
  CONSTRAINT "waitlist_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL,
  CONSTRAINT "waitlist_status_check" CHECK ((status = ANY (ARRAY['waiting'::text, 'notified'::text, 'booked'::text, 'expired'::text])))
);

ALTER TABLE "public"."waitlist"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their waitlist" ON "public"."waitlist"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."waitlist" TO "authenticated", "postgres", "service_role";
