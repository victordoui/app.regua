CREATE OR REPLACE FUNCTION public.handle_new_client_profile()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
    INSERT INTO public.user_roles (user_id, role, barbershop_user_id)
    VALUES (NEW.user_id, 'cliente', NEW.barbershop_user_id)
    ON CONFLICT (user_id, role, barbershop_user_id) DO NOTHING;
    RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."handle_new_client_profile"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."handle_new_client_profile"() FROM PUBLIC;
