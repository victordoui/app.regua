CREATE TABLE "public"."barbershop_settings" (
  "id"                        uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                   uuid                     NOT NULL,
  "company_name"              text                     NOT NULL,
  "slogan"                    text,
  "logo_url"                  text,
  "banner_url"                text,
  "primary_color_hex"         text                     DEFAULT '#0ea5e9'::text,
  "secondary_color_hex"       text                     DEFAULT '#1f2937'::text,
  "address"                   text,
  "phone"                     text,
  "email"                     text,
  "is_public_page_enabled"    boolean                  DEFAULT true,
  "created_at"                timestamp with time zone DEFAULT now(),
  "updated_at"                timestamp with time zone DEFAULT now(),
  "instagram_url"             text,
  "facebook_url"              text,
  "whatsapp_number"           text,
  "cancellation_hours_before" integer                  DEFAULT 24,
  "allow_online_cancellation" boolean                  DEFAULT true,
  "buffer_minutes"            integer                  DEFAULT 0,
  "noshow_fee_enabled"        boolean                  DEFAULT false,
  "noshow_fee_amount"         numeric                  DEFAULT 0,
  "allow_guest_booking"       boolean                  DEFAULT true,
  "onboarding_completed"      boolean                  DEFAULT false,
  CONSTRAINT "barbershop_settings_pkey" PRIMARY KEY (id),
  CONSTRAINT "barbershop_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "barbershop_settings_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."barbershop_settings"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_barbershop_settings_onboarding ON public.barbershop_settings USING btree (user_id, onboarding_completed);

CREATE TRIGGER sync_public_business_profile_after_change
  AFTER INSERT OR UPDATE ON public.barbershop_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_public_business_profile();

CREATE TRIGGER update_barbershop_settings_updated_at
  BEFORE UPDATE ON public.barbershop_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Allow public read access by user_id" ON "public"."barbershop_settings"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

CREATE POLICY "Owners can insert their settings" ON "public"."barbershop_settings"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Owners can update their settings" ON "public"."barbershop_settings"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Owners can view their settings" ON "public"."barbershop_settings"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."barbershop_settings" TO "authenticated", "postgres", "service_role";
