-- Adicionar colunas de redes sociais na tabela barbershop_settings
ALTER TABLE public.barbershop_settings
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;