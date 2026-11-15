CREATE OR REPLACE FUNCTION public.validate_client_profile_link()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  _actor uuid := auth.uid();
  _account_email text;
  _client_email text;
  _client_business uuid;
begin
  -- Service operations without an end-user JWT remain available for controlled
  -- maintenance. End users must prove that the linked client belongs to their
  -- authenticated e-mail in the same business.
  if _actor is null or new.barbershop_user_id = _actor then
    return new;
  end if;

  if new.user_id <> _actor then
    raise exception 'CLIENT_PROFILE_OWNER_MISMATCH' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and (
    new.user_id is distinct from old.user_id
    or new.barbershop_user_id is distinct from old.barbershop_user_id
  ) then
    raise exception 'CLIENT_PROFILE_IDENTITY_IMMUTABLE' using errcode = '42501';
  end if;

  if new.client_id is not null then
    select lower(trim(u.email))
      into _account_email
    from auth.users u
    where u.id = _actor;

    select lower(trim(c.email)), c.user_id
      into _client_email, _client_business
    from public.clients c
    where c.id = new.client_id;

    if _account_email is null
      or _client_email is null
      or _account_email <> _client_email
      or _client_business is distinct from new.barbershop_user_id
    then
      raise exception 'CLIENT_LINK_EMAIL_MISMATCH' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."validate_client_profile_link"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."validate_client_profile_link"() FROM PUBLIC;
