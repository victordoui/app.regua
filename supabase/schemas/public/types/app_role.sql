CREATE TYPE "public"."app_role" AS ENUM (
  'admin',
  'barbeiro',
  'cliente',
  'super_admin'
);

GRANT USAGE ON TYPE "public"."app_role" TO "postgres";
