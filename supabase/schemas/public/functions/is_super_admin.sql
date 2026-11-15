CREATE OR REPLACE FUNCTION public.is_super_admin (
  _user_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$function$;

GRANT EXECUTE ON FUNCTION "public"."is_super_admin"(uuid) TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."is_super_admin"(uuid) FROM PUBLIC;
