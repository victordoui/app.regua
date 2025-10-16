-- Create role enum type
CREATE TYPE public.user_role AS ENUM ('admin', 'barbeiro', 'cliente');

-- Add role column to profiles table  
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'cliente';

-- Create function to create dev user and profile
CREATE OR REPLACE FUNCTION public.create_dev_user_and_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    dev_user_id uuid;
BEGIN
    -- Check if dev user already exists
    SELECT id INTO dev_user_id 
    FROM auth.users 
    WHERE email = 'dev@test.com' 
    LIMIT 1;
    
    -- If user doesn't exist, we need to create via auth
    -- For now, just create the profile if user exists
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

-- Execute the function
SELECT public.create_dev_user_and_profile();