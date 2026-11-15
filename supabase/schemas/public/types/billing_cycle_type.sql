CREATE TYPE "public"."billing_cycle_type" AS ENUM (
  'monthly',
  'yearly'
);

GRANT USAGE ON TYPE "public"."billing_cycle_type" TO "postgres";
