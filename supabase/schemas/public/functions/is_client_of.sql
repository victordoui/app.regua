CREATE OR REPLACE FUNCTION public.is_client_of (
  _user_id            uuid,
  _barbershop_user_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'cliente'
      AND barbershop_user_id = _barbershop_user_id
  )
$function$;

GRANT EXECUTE ON FUNCTION "public"."is_client_of"(uuid, uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."is_client_of"(uuid, uuid) FROM PUBLIC;
