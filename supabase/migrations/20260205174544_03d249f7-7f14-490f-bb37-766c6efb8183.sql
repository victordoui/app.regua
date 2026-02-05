-- Tabela de assinaturas do sistema (donos de barbearia)
CREATE TABLE public.platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    plan_type TEXT NOT NULL DEFAULT 'trial',
    status TEXT NOT NULL DEFAULT 'active',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    max_barbers INT DEFAULT 3,
    max_appointments_month INT DEFAULT 100,
    features JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cupons globais do sistema
CREATE TABLE public.platform_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    max_uses INT,
    current_uses INT DEFAULT 0,
    applicable_plans TEXT[],
    active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs de ações do super admin
CREATE TABLE public.platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL,
    action TEXT NOT NULL,
    target_user_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_platform_subscriptions_user ON platform_subscriptions(user_id);
CREATE INDEX idx_platform_subscriptions_status ON platform_subscriptions(status);
CREATE INDEX idx_platform_coupons_code ON platform_coupons(code);
CREATE INDEX idx_platform_audit_logs_admin ON platform_audit_logs(super_admin_id);

-- RLS
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas super_admin pode gerenciar
CREATE POLICY "Super admins can manage platform_subscriptions"
ON platform_subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage platform_coupons"
ON platform_coupons FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view audit logs"
ON platform_audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert audit logs"
ON platform_audit_logs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Trigger para updated_at
CREATE TRIGGER update_platform_subscriptions_updated_at
BEFORE UPDATE ON platform_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();