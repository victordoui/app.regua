CREATE TABLE "public"."discount_coupons" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "code"           text                     NOT NULL,
  "discount_type"  text                     NOT NULL,
  "discount_value" numeric                  NOT NULL,
  "min_purchase"   numeric                  DEFAULT 0,
  "max_uses"       integer,
  "current_uses"   integer                  DEFAULT 0,
  "valid_from"     date,
  "valid_until"    date,
  "active"         boolean                  DEFAULT true,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "discount_coupons_discount_type_check" CHECK ((discount_type = ANY (ARRAY['percent'::text, 'fixed'::text]))),
  CONSTRAINT "discount_coupons_pkey" PRIMARY KEY (id),
  CONSTRAINT "discount_coupons_user_id_code_key" UNIQUE (user_id, code)
);

ALTER TABLE "public"."discount_coupons"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active coupons" ON "public"."discount_coupons"
  FOR SELECT
  TO "authenticated"
  USING ((active = true));

CREATE POLICY "Users can manage their coupons" ON "public"."discount_coupons"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."discount_coupons" TO "authenticated", "postgres", "service_role";
