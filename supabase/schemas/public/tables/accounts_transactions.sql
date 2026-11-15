CREATE TABLE "public"."accounts_transactions" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "description" text                     NOT NULL,
  "amount"      numeric(10,2)            NOT NULL,
  "due_date"    date                     NOT NULL,
  "category"    text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "accounts_transactions_pkey" PRIMARY KEY (id),
  CONSTRAINT "accounts_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."accounts_transactions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."accounts_transactions"
  ADD COLUMN "status" public.transaction_status NOT NULL DEFAULT 'pending'::public.transaction_status;

ALTER TABLE "public"."accounts_transactions"
  ADD COLUMN "type" public.transaction_type NOT NULL;

CREATE TRIGGER update_accounts_transactions_updated_at
  BEFORE UPDATE ON public.accounts_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can delete their own accounts transactions" ON "public"."accounts_transactions"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own accounts transactions" ON "public"."accounts_transactions"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own accounts transactions" ON "public"."accounts_transactions"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own accounts transactions" ON "public"."accounts_transactions"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."accounts_transactions" TO "authenticated", "postgres", "service_role";
