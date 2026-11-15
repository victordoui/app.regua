CREATE TYPE "public"."transaction_status" AS ENUM (
  'pending',
  'paid',
  'overdue',
  'received',
  'cancelled'
);

GRANT USAGE ON TYPE "public"."transaction_status" TO "postgres";
