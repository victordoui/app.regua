CREATE TABLE "public"."barber_absences" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "barber_id"  uuid                     NOT NULL,
  "start_date" date                     NOT NULL,
  "end_date"   date                     NOT NULL,
  "type"       text                     DEFAULT 'vacation'::text,
  "notes"      text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "barber_absences_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."barber_absences"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their barber absences" ON "public"."barber_absences"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."barber_absences" TO "authenticated", "postgres", "service_role";
