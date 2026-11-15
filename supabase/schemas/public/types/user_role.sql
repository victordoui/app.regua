CREATE TYPE "public"."user_role" AS ENUM (
  'admin',
  'barbeiro',
  'cliente'
);

GRANT USAGE ON TYPE "public"."user_role" TO "postgres";
