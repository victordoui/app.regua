CREATE TABLE "public"."professional_directory" (
  "id"              uuid   NOT NULL,
  "user_id"         uuid   NOT NULL,
  "display_name"    text,
  "avatar_url"      text,
  "specializations" text[] NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT "professional_directory_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."professional_directory"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public professionals are discoverable" ON "public"."professional_directory"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."professional_directory" TO "anon", "authenticated", "postgres", "service_role";
