CREATE TABLE "public"."sales" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "client_id"      uuid,
  "sale_date"      timestamp with time zone NOT NULL DEFAULT now(),
  "total_amount"   numeric(10,2)            NOT NULL,
  "payment_method" text,
  "notes"          text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "sales_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT "sales_pkey" PRIMARY KEY (id),
  CONSTRAINT "sales_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."sales"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Owners can delete their sales" ON "public"."sales"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Owners can insert their sales" ON "public"."sales"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Owners can update their sales" ON "public"."sales"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Owners can view their sales" ON "public"."sales"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sales" TO "authenticated", "postgres", "service_role";
