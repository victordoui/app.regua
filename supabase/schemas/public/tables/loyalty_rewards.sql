CREATE TABLE "public"."loyalty_rewards" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "name"            text                     NOT NULL,
  "points_required" integer                  NOT NULL,
  "reward_type"     text                     NOT NULL,
  "reward_value"    numeric,
  "active"          boolean                  NOT NULL DEFAULT true,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "loyalty_rewards_pkey" PRIMARY KEY (id),
  CONSTRAINT "loyalty_rewards_reward_type_check" CHECK ((reward_type = ANY (ARRAY['discount'::text, 'service'::text, 'product'::text])))
);

ALTER TABLE "public"."loyalty_rewards"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active rewards" ON "public"."loyalty_rewards"
  FOR SELECT
  TO "authenticated"
  USING ((active = true));

CREATE POLICY "Users can manage their rewards" ON "public"."loyalty_rewards"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."loyalty_rewards" TO "authenticated", "postgres", "service_role";
