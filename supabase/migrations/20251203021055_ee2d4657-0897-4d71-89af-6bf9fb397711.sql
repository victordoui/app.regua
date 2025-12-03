-- Adicionar colunas faltantes na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS specializations text[] DEFAULT '{}';

-- Criar índice para buscas por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Criar índice para buscas por active
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(active);

-- Inserir dados iniciais de serviços se não existirem
INSERT INTO public.services (user_id, name, description, price, duration_minutes, active)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  s.name,
  s.description,
  s.price,
  s.duration_minutes,
  true
FROM (
  VALUES 
    ('Corte Clássico', 'Corte de cabelo tradicional masculino', 50.00, 30),
    ('Barba Completa', 'Barba com toalha quente e finalização', 40.00, 30),
    ('Combo Corte + Barba', 'Corte e barba com desconto especial', 85.00, 60),
    ('Corte Degradê', 'Corte moderno com degradê', 55.00, 40),
    ('Sobrancelha', 'Design e limpeza de sobrancelha', 20.00, 15)
) AS s(name, description, price, duration_minutes)
WHERE NOT EXISTS (SELECT 1 FROM public.services LIMIT 1);