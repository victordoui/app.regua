CREATE TABLE public.business_monthly_goals (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start date NOT NULL CHECK (EXTRACT(DAY FROM month_start) = 1),
  revenue_target numeric(12,2) NOT NULL CHECK (revenue_target >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month_start)
);

ALTER TABLE public.business_monthly_goals ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_business_monthly_goals_updated_at
  BEFORE UPDATE ON public.business_monthly_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Owners can manage their monthly business goals" ON public.business_monthly_goals
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_monthly_goals TO authenticated, service_role;
