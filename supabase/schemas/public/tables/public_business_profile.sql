CREATE TABLE "public"."public_business_profile" (
  "user_id"                   uuid    NOT NULL,
  "company_name"              text    NOT NULL,
  "slogan"                    text,
  "logo_url"                  text,
  "banner_url"                text,
  "primary_color_hex"         text,
  "secondary_color_hex"       text,
  "address"                   text,
  "phone"                     text,
  "instagram_url"             text,
  "facebook_url"              text,
  "whatsapp_number"           text,
  "cancellation_hours_before" integer,
  "allow_online_cancellation" boolean,
  "allow_guest_booking"       boolean,
  "buffer_minutes"            integer NOT NULL DEFAULT 0,
  CONSTRAINT "public_business_profile_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."public_business_profile"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public businesses are discoverable" ON "public"."public_business_profile"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."public_business_profile" TO "anon", "authenticated", "postgres", "service_role";
