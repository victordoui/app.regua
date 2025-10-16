-- Fix security issues by updating functions with proper search_path

-- Update the existing update_updated_at_column function 
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the create_dev_user_and_profile function
CREATE OR REPLACE FUNCTION public.create_dev_user_and_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    dev_user_id uuid;
BEGIN
    -- Check if dev user already exists
    SELECT id INTO dev_user_id 
    FROM auth.users 
    WHERE email = 'dev@test.com' 
    LIMIT 1;
    
    -- If user exists, create/update profile
    IF dev_user_id IS NOT NULL THEN
        -- Insert or update profile for dev user  
        INSERT INTO public.profiles (user_id, display_name, email, role)
        VALUES (dev_user_id, 'Desenvolvedor', 'dev@test.com', 'admin'::public.user_role)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            display_name = 'Desenvolvedor',
            email = 'dev@test.com', 
            role = 'admin'::public.user_role;
    END IF;
END;
$$;