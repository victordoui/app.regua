-- Create pricing_rules table for dynamic pricing
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('time_based', 'day_based', 'barber_based', 'promo')),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  price_modifier_type TEXT NOT NULL DEFAULT 'percentage' CHECK (price_modifier_type IN ('percentage', 'fixed')),
  price_modifier_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for owners
CREATE POLICY "Users can view their own pricing rules" ON pricing_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pricing rules" ON pricing_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing rules" ON pricing_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing rules" ON pricing_rules
  FOR DELETE USING (auth.uid() = user_id);

-- Public policy for booking flow (read active rules from any barbershop)
CREATE POLICY "Public can view active pricing rules" ON pricing_rules
  FOR SELECT TO anon USING (active = true);

-- Updated_at trigger
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();