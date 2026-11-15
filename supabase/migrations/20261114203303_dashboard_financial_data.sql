-- Reconcile financial tables referenced by the app and canonical schema snapshots.
-- Idempotent so environments that already have these objects remain unchanged.

DO $migration$
BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('pending', 'paid', 'overdue', 'received', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END
$migration$;

DO $migration$
BEGIN
  CREATE TYPE public.transaction_type AS ENUM ('payable', 'receivable');
EXCEPTION WHEN duplicate_object THEN NULL;
END
$migration$;

CREATE TABLE IF NOT EXISTS public.accounts_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  due_date date NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status public.transaction_status NOT NULL DEFAULT 'pending',
  type public.transaction_type NOT NULL
);

ALTER TABLE public.accounts_transactions
  ADD COLUMN IF NOT EXISTS status public.transaction_status NOT NULL DEFAULT 'pending';
ALTER TABLE public.accounts_transactions
  ADD COLUMN IF NOT EXISTS type public.transaction_type NOT NULL DEFAULT 'payable';
ALTER TABLE public.accounts_transactions ALTER COLUMN type DROP DEFAULT;
ALTER TABLE public.accounts_transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS accounts_transactions_user_due_date_idx
  ON public.accounts_transactions (user_id, due_date);

DROP TRIGGER IF EXISTS update_accounts_transactions_updated_at ON public.accounts_transactions;
CREATE TRIGGER update_accounts_transactions_updated_at
  BEFORE UPDATE ON public.accounts_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Users can view their own accounts transactions" ON public.accounts_transactions;
CREATE POLICY "Users can view their own accounts transactions" ON public.accounts_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own accounts transactions" ON public.accounts_transactions;
CREATE POLICY "Users can insert their own accounts transactions" ON public.accounts_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own accounts transactions" ON public.accounts_transactions;
CREATE POLICY "Users can update their own accounts transactions" ON public.accounts_transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own accounts transactions" ON public.accounts_transactions;
CREATE POLICY "Users can delete their own accounts transactions" ON public.accounts_transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sale_date timestamptz NOT NULL DEFAULT now(),
  total_amount numeric(10,2) NOT NULL,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS sales_user_sale_date_idx ON public.sales (user_id, sale_date);
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Owners can view their sales" ON public.sales;
CREATE POLICY "Owners can view their sales" ON public.sales FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owners can insert their sales" ON public.sales;
CREATE POLICY "Owners can insert their sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owners can update their sales" ON public.sales;
CREATE POLICY "Owners can update their sales" ON public.sales FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owners can delete their sales" ON public.sales;
CREATE POLICY "Owners can delete their sales" ON public.sales FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON public.sale_items (sale_id);
DROP TRIGGER IF EXISTS update_sale_items_updated_at ON public.sale_items;
CREATE TRIGGER update_sale_items_updated_at
  BEFORE UPDATE ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Owners can view their sale items" ON public.sale_items;
CREATE POLICY "Owners can view their sale items" ON public.sale_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can insert their sale items" ON public.sale_items;
CREATE POLICY "Owners can insert their sale items" ON public.sale_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can update their sale items" ON public.sale_items;
CREATE POLICY "Owners can update their sale items" ON public.sale_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can delete their sale items" ON public.sale_items;
CREATE POLICY "Owners can delete their sale items" ON public.sale_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));

GRANT USAGE ON TYPE public.transaction_status, public.transaction_type TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts_transactions, public.sales, public.sale_items TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.business_monthly_goals (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start date NOT NULL CHECK (EXTRACT(DAY FROM month_start) = 1),
  revenue_target numeric(12,2) NOT NULL CHECK (revenue_target >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month_start)
);

ALTER TABLE public.business_monthly_goals ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_business_monthly_goals_updated_at ON public.business_monthly_goals;
CREATE TRIGGER update_business_monthly_goals_updated_at
  BEFORE UPDATE ON public.business_monthly_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP POLICY IF EXISTS "Owners can manage their monthly business goals" ON public.business_monthly_goals;
CREATE POLICY "Owners can manage their monthly business goals" ON public.business_monthly_goals
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_monthly_goals TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
