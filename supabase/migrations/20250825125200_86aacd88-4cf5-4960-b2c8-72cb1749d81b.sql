-- Fix the remaining function with search_path issue
CREATE OR REPLACE FUNCTION public.create_dev_profile_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    dev_user_id uuid;
BEGIN
    -- Procurar pelo usuário dev@test.com na tabela auth.users
    SELECT id INTO dev_user_id 
    FROM auth.users 
    WHERE email = 'dev@test.com' 
    LIMIT 1;
    
    -- Se o usuário existe e não tem perfil, criar perfil
    IF dev_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, display_name, email)
        VALUES (dev_user_id, 'Desenvolvedor', 'dev@test.com')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END;
$$;