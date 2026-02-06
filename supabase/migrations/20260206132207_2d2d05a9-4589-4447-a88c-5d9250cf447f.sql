
-- Allow authenticated users to insert their own subscription (for self-signup)
CREATE POLICY "Users can insert their own subscription"
ON public.platform_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own subscription
CREATE POLICY "Users can read their own subscription"
ON public.platform_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- Atomic function to create subscriber profile + subscription
CREATE OR REPLACE FUNCTION public.create_subscriber_with_subscription(
  _user_id uuid,
  _display_name text,
  _email text,
  _plan_type text DEFAULT 'trial',
  _company_name text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan platform_plan_config%ROWTYPE;
BEGIN
  -- Get plan config
  SELECT * INTO _plan FROM platform_plan_config WHERE plan_type = _plan_type LIMIT 1;

  -- Create profile
  INSERT INTO profiles (user_id, display_name, email, role)
  VALUES (_user_id, _display_name, _email, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET display_name = _display_name, email = _email;

  -- Assign admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create barbershop settings
  INSERT INTO barbershop_settings (user_id, company_name)
  VALUES (_user_id, _company_name)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create subscription
  INSERT INTO platform_subscriptions (user_id, plan_type, status, start_date, end_date, max_barbers, max_appointments_month, features)
  VALUES (
    _user_id,
    _plan_type,
    'active',
    now(),
    CASE WHEN _plan_type = 'trial' THEN now() + interval '14 days' ELSE now() + interval '30 days' END,
    COALESCE(_plan.max_barbers, 3),
    COALESCE(_plan.max_appointments_month, 100),
    COALESCE(_plan.features, '{}'::jsonb)
  );
END;
$$;
