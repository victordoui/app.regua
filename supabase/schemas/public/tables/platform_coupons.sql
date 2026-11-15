CREATE TABLE "public"."platform_coupons" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "code"             text                     NOT NULL,
  "description"      text,
  "discount_type"    text                     NOT NULL,
  "discount_value"   numeric                  NOT NULL,
  "valid_from"       date                     DEFAULT ((now() AT TIME ZONE 'America/Sao_Paulo'::text)::date),
  "valid_until"      date,
  "max_uses"         integer,
  "current_uses"     integer                  DEFAULT 0,
  "applicable_plans" text[],
  "active"           boolean                  DEFAULT true,
  "created_by"       uuid,
  "created_at"       timestamp with time zone DEFAULT now(),
  CONSTRAINT "platform_coupons_code_key" UNIQUE (code),
  CONSTRAINT "platform_coupons_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."platform_coupons"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_platform_coupons_code ON public.platform_coupons USING btree (code);

CREATE POLICY "Super admins can manage platform_coupons" ON "public"."platform_coupons"
  FOR ALL
  TO PUBLIC
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_coupons" TO "authenticated", "postgres", "service_role";
