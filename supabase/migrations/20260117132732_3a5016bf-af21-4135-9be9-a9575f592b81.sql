-- =====================================================
-- SPRINT 6: GIFT CARDS SYSTEM
-- =====================================================

-- 1. Tabela principal de Gift Cards
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  original_value NUMERIC(10,2) NOT NULL,
  current_balance NUMERIC(10,2) NOT NULL,
  buyer_name TEXT,
  buyer_email TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  message TEXT,
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_cards_user_id ON public.gift_cards(user_id);
CREATE INDEX idx_gift_cards_status ON public.gift_cards(status);
CREATE INDEX idx_gift_cards_recipient_email ON public.gift_cards(recipient_email);

-- Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para gift_cards
CREATE POLICY "Users can view their own gift cards" 
  ON public.gift_cards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gift cards" 
  ON public.gift_cards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gift cards" 
  ON public.gift_cards FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gift cards" 
  ON public.gift_cards FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Tabela de transações de Gift Cards
CREATE TABLE IF NOT EXISTS public.gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_gc_transactions_gift_card ON public.gift_card_transactions(gift_card_id);
CREATE INDEX idx_gc_transactions_user_id ON public.gift_card_transactions(user_id);
CREATE INDEX idx_gc_transactions_appointment ON public.gift_card_transactions(appointment_id);

-- Enable RLS
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transações
CREATE POLICY "Users can view their own gift card transactions" 
  ON public.gift_card_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gift card transactions" 
  ON public.gift_card_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);