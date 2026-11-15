CREATE TYPE "public"."subscription_status" AS ENUM (
  'active',
  'cancelled',
  'paused',
  'expired'
);

GRANT USAGE ON TYPE "public"."subscription_status" TO "postgres";
