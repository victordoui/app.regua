CREATE TYPE "public"."transaction_type" AS ENUM (
  'payable',
  'receivable'
);

GRANT USAGE ON TYPE "public"."transaction_type" TO "postgres";
