-- Migration for Cash Barber Subscription System
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  services_included INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
  credits_per_cycle INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  next_billing_date DATE,
  credits_remaining INTEGER DEFAULT 0,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  payment_method JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription credits table for tracking usage
CREATE TABLE public.subscription_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL DEFAULT 1,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('used', 'refunded', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create barbershop performance metrics table
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  barbeiro_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  appointments_completed INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  client_satisfaction_avg DECIMAL(3,2) DEFAULT 0,
  services_upsold INTEGER DEFAULT 0,
  new_clients_acquired INTEGER DEFAULT 0,
  subscription_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(barbeiro_id, metric_date)
);

-- Create client feedback table
CREATE TABLE public.client_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  barbeiro_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create barbeiro goals table
CREATE TABLE public.barbeiro_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbeiro_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('monthly_revenue', 'appointments_count', 'client_satisfaction', 'subscription_sales')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  achieved BOOLEAN DEFAULT false,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbeiro_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans
FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage subscription plans"
ON public.subscription_plans
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for subscription_credits
CREATE POLICY "Users can view their subscription credits"
ON public.subscription_credits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_subscriptions.id = subscription_credits.subscription_id 
    AND user_subscriptions.user_id = auth.uid()
  )
);

-- Create RLS policies for performance_metrics
CREATE POLICY "Users can view their own performance metrics"
ON public.performance_metrics
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for client_feedback
CREATE POLICY "Users can view feedback for their clients"
ON public.client_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_feedback.client_id 
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create feedback for their appointments"
ON public.client_feedback
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE appointments.id = client_feedback.appointment_id 
    AND appointments.user_id = auth.uid()
  )
);

-- Create RLS policies for barbeiro_goals
CREATE POLICY "Barbeiros can view their own goals"
ON public.barbeiro_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = barbeiro_goals.barbeiro_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_client_id ON public.user_subscriptions(client_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_subscription_credits_subscription_id ON public.subscription_credits(subscription_id);
CREATE INDEX idx_performance_metrics_barbeiro_date ON public.performance_metrics(barbeiro_id, metric_date);
CREATE INDEX idx_client_feedback_client_id ON public.client_feedback(client_id);
CREATE INDEX idx_client_feedback_barbeiro_id ON public.client_feedback(barbeiro_id);
CREATE INDEX idx_barbeiro_goals_barbeiro_id ON public.barbeiro_goals(barbeiro_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at
  BEFORE UPDATE ON public.performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_barbeiro_goals_updated_at
  BEFORE UPDATE ON public.barbeiro_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_cycle, services_included, credits_per_cycle, features) VALUES
('Plano Básico', 'Ideal para clientes ocasionais', 49.90, 'monthly', 2, 2, '["Corte de cabelo", "Agendamento prioritário"]'),
('Plano Premium', 'Para clientes frequentes', 89.90, 'monthly', 4, 4, '["Corte de cabelo", "Barba", "Agendamento prioritário", "Desconto em produtos"]'),
('Plano VIP', 'Experiência completa', 149.90, 'monthly', 0, 0, '["Serviços ilimitados", "Agendamento prioritário", "Desconto em produtos", "Atendimento personalizado"]'),
('Plano Anual Básico', 'Economia no plano anual', 499.90, 'yearly', 24, 24, '["Corte de cabelo", "Agendamento prioritário", "2 meses grátis"]'),
('Plano Anual Premium', 'Melhor custo-benefício', 899.90, 'yearly', 48, 48, '["Corte de cabelo", "Barba", "Agendamento prioritário", "Desconto em produtos", "2 meses grátis"]');