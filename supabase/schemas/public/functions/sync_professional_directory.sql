CREATE OR REPLACE FUNCTION public.sync_professional_directory()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  if tg_op = 'DELETE' then
    delete from public.professional_directory where id = old.id;
    return old;
  end if;

  if new.role = 'barbeiro' and new.active = true then
    insert into public.professional_directory (id, user_id, display_name, avatar_url, specializations)
    values (new.id, new.user_id, new.display_name, new.avatar_url, coalesce(new.specializations, '{}'))
    on conflict (id) do update
    set user_id = excluded.user_id,
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        specializations = excluded.specializations;
  else
    delete from public.professional_directory where id = new.id;
  end if;

  return new;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."sync_professional_directory"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."sync_professional_directory"() FROM PUBLIC;
