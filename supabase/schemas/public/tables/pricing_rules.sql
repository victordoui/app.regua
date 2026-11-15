CREATE TABLE "public"."pricing_rules" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"              uuid                     NOT NULL,
  "name"                 text                     NOT NULL,
  "rule_type"            text                     NOT NULL,
  "service_id"           uuid,
  "barber_id"            uuid,
  "day_of_week"          integer,
  "start_time"           time without time zone,
  "end_time"             time without time zone,
  "price_modifier_type"  text                     NOT NULL DEFAULT 'percentage'::text,
  "price_modifier_value" numeric(10,2)            NOT NULL DEFAULT 0,
  "valid_from"           date,
  "valid_until"          date,
  "active"               boolean                  DEFAULT true,
  "priority"             integer                  DEFAULT 0,
  "created_at"           timestamp with time zone DEFAULT now(),
  "updated_at"           timestamp with time zone DEFAULT now(),
  CONSTRAINT "pricing_rules_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6))),
  CONSTRAINT "pricing_rules_pkey" PRIMARY KEY (id),
  CONSTRAINT "pricing_rules_price_modifier_type_check" CHECK ((price_modifier_type = ANY (ARRAY['percentage'::text, 'fixed'::text]))),
  CONSTRAINT "pricing_rules_rule_type_check" CHECK ((rule_type = ANY (ARRAY['time_based'::text, 'day_based'::text, 'barber_based'::text, 'promo'::text]))),
  CONSTRAINT "pricing_rules_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "pricing_rules_barber_id_fkey" FOREIGN KEY (barber_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT "pricing_rules_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

ALTER TABLE "public"."pricing_rules"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can view active pricing rules" ON "public"."pricing_rules"
  FOR SELECT
  TO "anon"
  USING ((active = true));

CREATE POLICY "Users can delete their own pricing rules" ON "public"."pricing_rules"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own pricing rules" ON "public"."pricing_rules"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own pricing rules" ON "public"."pricing_rules"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own pricing rules" ON "public"."pricing_rules"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."pricing_rules" TO "authenticated", "postgres", "service_role";
