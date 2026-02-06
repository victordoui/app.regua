-- =============================================
-- SUPER ADMIN ADVANCED FEATURES - DATABASE MIGRATION
-- =============================================

-- 1. Platform Payments Table
CREATE TABLE public.platform_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES platform_subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT, -- pix, credit_card, boleto
    status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
    invoice_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage platform payments"
ON public.platform_payments
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 2. Platform Broadcast Messages Table
CREATE TABLE public.platform_broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    channel TEXT NOT NULL, -- email, push, sms
    target_plans TEXT[], -- ['basic', 'pro', 'enterprise'] or null for all
    target_status TEXT[], -- ['active'] or null for all
    sent_count INT DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_broadcast_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage broadcast messages"
ON public.platform_broadcast_messages
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 3. Platform Email Templates Table
CREATE TABLE public.platform_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    trigger_event TEXT, -- welcome, renewal_reminder, payment_failed, plan_upgrade
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage email templates"
ON public.platform_email_templates
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 4. Platform Plan Configuration Table
CREATE TABLE public.platform_plan_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL UNIQUE, -- trial, basic, pro, enterprise
    display_name TEXT NOT NULL,
    price_monthly NUMERIC NOT NULL DEFAULT 0,
    price_yearly NUMERIC,
    max_barbers INT NOT NULL DEFAULT 3,
    max_appointments_month INT NOT NULL DEFAULT 100,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_plan_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage plan configs"
ON public.platform_plan_config
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Anyone can read active plan configs"
ON public.platform_plan_config
FOR SELECT
USING (is_active = true);

-- 5. Platform Support Tickets Table
CREATE TABLE public.platform_support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    assigned_to UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all tickets"
ON public.platform_support_tickets
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own tickets"
ON public.platform_support_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
ON public.platform_support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. Platform Ticket Messages Table
CREATE TABLE public.platform_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES platform_support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all ticket messages"
ON public.platform_ticket_messages
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view non-internal messages on their tickets"
ON public.platform_ticket_messages
FOR SELECT
USING (
    is_internal = false AND
    EXISTS (
        SELECT 1 FROM platform_support_tickets
        WHERE id = ticket_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can add messages to their tickets"
ON public.platform_ticket_messages
FOR INSERT
WITH CHECK (
    is_internal = false AND
    EXISTS (
        SELECT 1 FROM platform_support_tickets
        WHERE id = ticket_id AND user_id = auth.uid()
    )
);

-- Triggers for updated_at
CREATE TRIGGER update_platform_email_templates_updated_at
BEFORE UPDATE ON public.platform_email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_plan_config_updated_at
BEFORE UPDATE ON public.platform_plan_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_support_tickets_updated_at
BEFORE UPDATE ON public.platform_support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial plan configurations
INSERT INTO public.platform_plan_config (plan_type, display_name, price_monthly, price_yearly, max_barbers, max_appointments_month, features, sort_order)
VALUES
    ('trial', 'Trial', 0, 0, 2, 50, '{"basic_scheduling": true, "client_management": true}', 0),
    ('basic', 'Básico', 79.90, 799, 3, 200, '{"basic_scheduling": true, "client_management": true, "reports": true}', 1),
    ('pro', 'Profissional', 149.90, 1499, 10, 1000, '{"basic_scheduling": true, "client_management": true, "reports": true, "loyalty": true, "campaigns": true}', 2),
    ('enterprise', 'Enterprise', 299.90, 2999, 50, 10000, '{"basic_scheduling": true, "client_management": true, "reports": true, "loyalty": true, "campaigns": true, "api_access": true, "priority_support": true}', 3)
ON CONFLICT (plan_type) DO NOTHING;