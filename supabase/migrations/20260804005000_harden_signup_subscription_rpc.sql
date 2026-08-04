-- Restrict public signup provisioning to the authenticated account itself.
create or replace function public.create_subscriber_with_subscription(
  _user_id uuid,
  _display_name text,
  _email text,
  _plan_type text default 'trial',
  _company_name text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _actor uuid := auth.uid();
  _account_email text;
  _plan public.platform_plan_config%rowtype;
begin
  if _actor is null or _actor <> _user_id then
    raise exception 'NOT_ALLOWED' using errcode = '28000';
  end if;

  select lower(email) into _account_email
  from auth.users
  where id = _actor;

  if _account_email is null or _account_email <> lower(trim(_email)) then
    raise exception 'EMAIL_MISMATCH' using errcode = 'P0001';
  end if;

  select * into _plan
  from public.platform_plan_config
  where plan_type = _plan_type
    and is_active = true
  limit 1;

  if not found then
    raise exception 'INVALID_PLAN' using errcode = 'P0001';
  end if;

  insert into public.profiles (user_id, display_name, email, role)
  values (_actor, _display_name, _account_email, 'admin')
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        email = excluded.email;

  insert into public.user_roles (user_id, role)
  values (_actor, 'admin')
  on conflict (user_id, role) do nothing;

  insert into public.barbershop_settings (user_id, company_name)
  values (_actor, _company_name)
  on conflict (user_id) do nothing;

  insert into public.platform_subscriptions (
    user_id, plan_type, status, payment_status, start_date, end_date,
    max_barbers, max_appointments_month, features
  )
  select
    _actor,
    _plan_type,
    case when _plan_type = 'trial' then 'active' else 'pending_payment' end,
    case when _plan_type = 'trial' then 'free' else 'pending' end,
    now(),
    case when _plan_type = 'trial' then now() + interval '14 days' else now() + interval '30 days' end,
    coalesce(_plan.max_barbers, 3),
    coalesce(_plan.max_appointments_month, 100),
    coalesce(_plan.features, '{}'::jsonb)
  where not exists (
    select 1 from public.platform_subscriptions
    where user_id = _actor
  );
end;
$$;

revoke all on function public.create_subscriber_with_subscription(uuid, text, text, text, text) from public, anon;
grant execute on function public.create_subscriber_with_subscription(uuid, text, text, text, text) to authenticated;
