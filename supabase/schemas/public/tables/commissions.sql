CREATE TABLE "public"."commissions" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "barber_id"      uuid                     NOT NULL,
  "appointment_id" uuid,
  "amount"         numeric                  NOT NULL,
  "status"         text                     DEFAULT 'pending'::text,
  "paid_at"        timestamp with time zone,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "commissions_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL,
  CONSTRAINT "commissions_pkey" PRIMARY KEY (id),
  CONSTRAINT "commissions_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text])))
);

ALTER TABLE "public"."commissions"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their commissions" ON "public"."commissions"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."commissions" TO "authenticated", "postgres", "service_role";
