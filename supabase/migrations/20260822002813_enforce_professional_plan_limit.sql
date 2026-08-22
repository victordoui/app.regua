create or replace function public.enforce_professional_plan_limit()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  _max_professionals integer;
  _current_professionals integer;
begin
  if new.role::text <> 'barbeiro' then
    return new;
  end if;

  select ps.max_barbers
    into _max_professionals
  from public.platform_subscriptions ps
  where ps.user_id = new.user_id
  order by ps.created_at desc
  limit 1;

  if _max_professionals is null then
    return new;
  end if;

  select count(*)::integer
    into _current_professionals
  from public.profiles p
  where p.user_id = new.user_id
    and p.role::text = 'barbeiro'
    and p.id <> new.id;

  if _current_professionals >= _max_professionals then
    raise exception using
      errcode = 'P0001',
      message = format('Limite do plano atingido: este plano permite até %s profissional(is).', _max_professionals);
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_professional_plan_limit_before_write on public.profiles;

create trigger enforce_professional_plan_limit_before_write
before insert or update of user_id, role on public.profiles
for each row
execute function public.enforce_professional_plan_limit();
