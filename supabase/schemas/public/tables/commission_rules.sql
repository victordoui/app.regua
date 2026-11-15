CREATE TABLE "public"."commission_rules" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "barber_id"        uuid,
  "service_id"       uuid,
  "commission_type"  text                     DEFAULT 'percent'::text,
  "commission_value" numeric                  NOT NULL,
  "created_at"       timestamp with time zone DEFAULT now(),
  CONSTRAINT "commission_rules_commission_type_check" CHECK ((commission_type = ANY (ARRAY['percent'::text, 'fixed'::text]))),
  CONSTRAINT "commission_rules_pkey" PRIMARY KEY (id),
  CONSTRAINT "commission_rules_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

ALTER TABLE "public"."commission_rules"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their commission rules" ON "public"."commission_rules"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."commission_rules" TO "authenticated", "postgres", "service_role";
