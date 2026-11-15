CREATE TABLE "public"."blocked_slots" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "barber_id"      uuid                     NOT NULL,
  "start_datetime" timestamp with time zone NOT NULL,
  "end_datetime"   timestamp with time zone NOT NULL,
  "reason"         text,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "blocked_slots_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."blocked_slots"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."blocked_slots"
  REPLICA IDENTITY FULL;

CREATE POLICY "blocked_slots_owner_manage" ON "public"."blocked_slots"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."blocked_slots" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."blocked_slots" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."blocked_slots" TO "authenticated";
