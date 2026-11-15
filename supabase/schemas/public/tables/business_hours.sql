CREATE TABLE "public"."business_hours" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "day_of_week" integer                  NOT NULL,
  "open_time"   time without time zone,
  "close_time"  time without time zone,
  "is_closed"   boolean                  DEFAULT false,
  "created_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "business_hours_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6))),
  CONSTRAINT "business_hours_pkey" PRIMARY KEY (id),
  CONSTRAINT "business_hours_user_id_day_of_week_key" UNIQUE (user_id, day_of_week)
);

ALTER TABLE "public"."business_hours"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_hours_owner_manage" ON "public"."business_hours"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "business_hours_public_read" ON "public"."business_hours"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."business_hours" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."business_hours" FROM "anon";

GRANT SELECT ON TABLE "public"."business_hours" TO "anon";

REVOKE ALL ON TABLE "public"."business_hours" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."business_hours" TO "authenticated";
