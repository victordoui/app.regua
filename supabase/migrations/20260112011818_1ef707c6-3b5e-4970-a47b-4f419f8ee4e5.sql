-- ========================================
-- FASE 1-6: TODAS AS 25 FUNCIONALIDADES
-- ========================================

-- 1. Alterações em barbershop_settings
ALTER TABLE barbershop_settings 
ADD COLUMN IF NOT EXISTS cancellation_hours_before INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS allow_online_cancellation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS noshow_fee_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS noshow_fee_amount NUMERIC DEFAULT 0;

-- 2. Alterações em notification_preferences
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- 3. Alteração em appointments (foto do resultado)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS result_photo_url TEXT;

-- 4. Alteração em clients (código de indicação)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 5. Tabela: favorite_barbers (barbeiros favoritos)
CREATE TABLE IF NOT EXISTS favorite_barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL,
  barbershop_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_profile_id, barber_id)
);

ALTER TABLE favorite_barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their favorites"
  ON favorite_barbers FOR SELECT
  USING (client_profile_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their favorites"
  ON favorite_barbers FOR ALL
  USING (client_profile_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  ));

-- 6. Tabela: blocked_slots (bloqueio de horários)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  barber_id UUID NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their blocked slots"
  ON blocked_slots FOR ALL
  USING (auth.uid() = user_id);

-- 7. Tabela: barber_absences (ausências/férias)
CREATE TABLE IF NOT EXISTS barber_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  barber_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type TEXT DEFAULT 'vacation',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE barber_absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their barber absences"
  ON barber_absences FOR ALL
  USING (auth.uid() = user_id);

-- 8. Tabela: appointment_services (multi-serviço)
CREATE TABLE IF NOT EXISTS appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their appointment services"
  ON appointment_services FOR ALL
  USING (appointment_id IN (
    SELECT id FROM appointments WHERE user_id = auth.uid()
  ));

-- 9. Tabela: business_hours (horários de funcionamento)
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their business hours"
  ON business_hours FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view business hours"
  ON business_hours FOR SELECT
  USING (true);

-- 10. Tabela: payments (pagamentos)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  pix_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their payments"
  ON payments FOR ALL
  USING (auth.uid() = user_id);

-- 11. Tabela: discount_coupons (cupons de desconto)
CREATE TABLE IF NOT EXISTS discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, code)
);

ALTER TABLE discount_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their coupons"
  ON discount_coupons FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active coupons"
  ON discount_coupons FOR SELECT
  USING (active = true);

-- 12. Tabela: commission_rules (regras de comissão)
CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  barber_id UUID,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  commission_type TEXT DEFAULT 'percent' CHECK (commission_type IN ('percent', 'fixed')),
  commission_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their commission rules"
  ON commission_rules FOR ALL
  USING (auth.uid() = user_id);

-- 13. Tabela: commissions (comissões calculadas)
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  barber_id UUID NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their commissions"
  ON commissions FOR ALL
  USING (auth.uid() = user_id);

-- 14. Tabela: email_campaigns (campanhas de email)
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  target_segment TEXT DEFAULT 'all',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their campaigns"
  ON email_campaigns FOR ALL
  USING (auth.uid() = user_id);

-- 15. Tabela: referrals (indicações)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referrer_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  referred_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  reward_given BOOLEAN DEFAULT false,
  reward_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their referrals"
  ON referrals FOR ALL
  USING (auth.uid() = user_id);

-- Criar trigger para updated_at em payments
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();