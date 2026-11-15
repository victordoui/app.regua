CREATE TABLE "public"."loyalty_transactions" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"           uuid                     NOT NULL,
  "loyalty_points_id" uuid,
  "type"              text                     NOT NULL,
  "points"            integer                  NOT NULL,
  "description"       text,
  "appointment_id"    uuid,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "loyalty_transactions_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL,
  CONSTRAINT "loyalty_transactions_loyalty_points_id_fkey" FOREIGN KEY (loyalty_points_id) REFERENCES public.loyalty_points(id) ON DELETE CASCADE,
  CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY (id),
  CONSTRAINT "loyalty_transactions_type_check" CHECK ((type = ANY (ARRAY['earn'::text, 'redeem'::text])))
);

ALTER TABLE "public"."loyalty_transactions"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their loyalty transactions" ON "public"."loyalty_transactions"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."loyalty_transactions" TO "authenticated", "postgres", "service_role";
