-- Adicionar campo onboarding_completed na tabela barbershop_settings
ALTER TABLE barbershop_settings 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_barbershop_settings_onboarding 
ON barbershop_settings(user_id, onboarding_completed);