
-- Fix: Add UNIQUE constraint on barbershop_settings.user_id for ON CONFLICT to work
ALTER TABLE public.barbershop_settings 
ADD CONSTRAINT barbershop_settings_user_id_key UNIQUE (user_id);

-- Add payment_status column to track payment state
ALTER TABLE public.platform_subscriptions 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Update existing trial subscriptions to 'free'
UPDATE public.platform_subscriptions 
SET payment_status = 'free' 
WHERE plan_type = 'trial' AND payment_status = 'pending';

-- Update RPC to set payment_status based on plan type
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
SET search_path TO 'public'
AS $$
DECLARE
  _plan platform_plan_config%ROWTYPE;
BEGIN
  SELECT * INTO _plan FROM platform_plan_config WHERE plan_type = _plan_type LIMIT 1;

  INSERT INTO profiles (user_id, display_name, email, role)
  VALUES (_user_id, _display_name, _email, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET display_name = _display_name, email = _email;

  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO barbershop_settings (user_id, company_name)
  VALUES (_user_id, _company_name)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO platform_subscriptions (user_id, plan_type, status, payment_status, start_date, end_date, max_barbers, max_appointments_month, features)
  VALUES (
    _user_id,
    _plan_type,
    CASE WHEN _plan_type = 'trial' THEN 'active' ELSE 'pending_payment' END,
    CASE WHEN _plan_type = 'trial' THEN 'free' ELSE 'pending' END,
    now(),
    CASE WHEN _plan_type = 'trial' THEN now() + interval '14 days' ELSE now() + interval '30 days' END,
    COALESCE(_plan.max_barbers, 3),
    COALESCE(_plan.max_appointments_month, 100),
    COALESCE(_plan.features, '{}'::jsonb)
  );
END;
$$;
