CREATE OR REPLACE FUNCTION public.is_current_user_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );
$function$;

GRANT EXECUTE ON FUNCTION "public"."is_current_user_admin"() TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."is_current_user_admin"() FROM PUBLIC;
