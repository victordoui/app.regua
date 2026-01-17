-- =====================================================
-- Sprint 8: Advanced Notifications System
-- =====================================================

-- 1. Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'whatsapp', 'push')),
  trigger TEXT NOT NULL CHECK (trigger IN (
    'appointment_reminder', 'appointment_confirmation', 'appointment_cancellation',
    'birthday', 'promotion', 'feedback_request', 'welcome', 'custom'
  )),
  subject TEXT,
  message TEXT NOT NULL,
  timing_hours INTEGER NOT NULL DEFAULT 24,
  active BOOLEAN DEFAULT true,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create notification_campaigns table
CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('promotional', 'informational', 'reminder')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'subscribers', 'vip', 'inactive', 'birthday')),
  channels TEXT[] NOT NULL DEFAULT '{}',
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  custom_message TEXT,
  scheduled_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  recipients_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- 3. Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.notification_campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp', 'push', 'system')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'bounced')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_templates_user_id ON public.notification_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_trigger ON public.notification_templates(trigger);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(active);

CREATE INDEX IF NOT EXISTS idx_notification_campaigns_user_id ON public.notification_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON public.notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_scheduled ON public.notification_campaigns(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_client_id ON public.notification_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_campaign_id ON public.notification_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON public.notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at);

-- 5. Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for notification_templates
CREATE POLICY "Users can view their own templates"
  ON public.notification_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON public.notification_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.notification_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.notification_templates FOR DELETE
  USING (auth.uid() = user_id);

-- 7. RLS Policies for notification_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.notification_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON public.notification_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.notification_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.notification_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- 8. RLS Policies for notification_logs
CREATE POLICY "Users can view their own logs"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Logs should not be updated or deleted by users (system managed)

-- 9. Create updated_at triggers
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_campaigns_updated_at
  BEFORE UPDATE ON public.notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();