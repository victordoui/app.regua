CREATE OR REPLACE FUNCTION public.current_business_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select coalesce(
    (
      select ur.barbershop_user_id
      from public.user_roles ur
      join public.profiles p
        on p.id = ur.profile_id
       and p.user_id = ur.barbershop_user_id
       and p.auth_user_id = ur.user_id
      where ur.user_id = auth.uid()
        and ur.barbershop_user_id is not null
        and ur.role in ('admin', 'barbeiro')
        and p.active = true
      order by case when ur.role = 'admin' then 0 else 1 end
      limit 1
    ),
    auth.uid()
  );
$function$;

GRANT EXECUTE ON FUNCTION "public"."current_business_id"() TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."current_business_id"() FROM PUBLIC;
