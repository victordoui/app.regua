-- Prevent business administrators from assigning platform-wide privileges.
drop policy if exists user_roles_owner_manage on public.user_roles;

create policy user_roles_super_admin_manage
on public.user_roles
for all
to authenticated
using ((select public.is_super_admin((select auth.uid()))))
with check ((select public.is_super_admin((select auth.uid()))));

create policy user_roles_business_admin_manage
on public.user_roles
for all
to authenticated
using (
  role <> 'super_admin'::public.app_role
  and profile_id is not null
  and (select public.is_current_user_admin())
  and exists (
    select 1
    from public.profiles p
    where p.id = user_roles.profile_id
      and p.user_id = (select auth.uid())
  )
)
with check (
  role <> 'super_admin'::public.app_role
  and profile_id is not null
  and (select public.is_current_user_admin())
  and exists (
    select 1
    from public.profiles p
    where p.id = user_roles.profile_id
      and p.user_id = (select auth.uid())
  )
);

-- Role lookup is internal authorization infrastructure, not a public API.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;

-- Subscriptions and commercial limits are created only by the hardened signup
-- RPC, a verified payment webhook, or a Super Admin.
drop policy if exists "Users can insert their own subscription"
on public.platform_subscriptions;
drop policy if exists "Users can read their own subscription"
on public.platform_subscriptions;
drop policy if exists "Super admins can manage platform_subscriptions"
on public.platform_subscriptions;

create policy platform_subscriptions_self_read
on public.platform_subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy platform_subscriptions_super_admin_manage
on public.platform_subscriptions
for all
to authenticated
using ((select public.is_super_admin((select auth.uid()))))
with check ((select public.is_super_admin((select auth.uid()))));

-- A public-booking user may edit personal details, but may never choose which
-- internal client record or business their account is linked to.
drop policy if exists client_profiles_owner_manage on public.client_profiles;
drop policy if exists client_profiles_self_insert on public.client_profiles;
drop policy if exists client_profiles_self_update on public.client_profiles;

create policy client_profiles_owner_read
on public.client_profiles
for select
to authenticated
using ((select auth.uid()) = barbershop_user_id);

create policy client_profiles_owner_update
on public.client_profiles
for update
to authenticated
using ((select auth.uid()) = barbershop_user_id)
with check ((select auth.uid()) = barbershop_user_id);

create policy client_profiles_owner_delete
on public.client_profiles
for delete
to authenticated
using ((select auth.uid()) = barbershop_user_id);

create policy client_profiles_self_insert
on public.client_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and client_id is null
);

create policy client_profiles_self_update
on public.client_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.validate_client_profile_link()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

revoke all on function public.validate_client_profile_link()
from public, anon, authenticated;

drop trigger if exists validate_client_profile_link_trigger
on public.client_profiles;

create trigger validate_client_profile_link_trigger
before insert or update on public.client_profiles
for each row execute function public.validate_client_profile_link();
