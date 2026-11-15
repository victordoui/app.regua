CREATE OR REPLACE FUNCTION public.create_dev_user_and_profile()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

GRANT EXECUTE ON FUNCTION "public"."create_dev_user_and_profile"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."create_dev_user_and_profile"() FROM PUBLIC;
