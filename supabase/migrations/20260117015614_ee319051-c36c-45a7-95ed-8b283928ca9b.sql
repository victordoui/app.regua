-- Add birth_date column to clients table for birthday tracking feature
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birth_date DATE;