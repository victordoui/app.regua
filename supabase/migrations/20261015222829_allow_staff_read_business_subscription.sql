drop policy if exists "platform_subscriptions_self_read"
  on public.platform_subscriptions;

drop policy if exists "platform_subscriptions_business_read"
  on public.platform_subscriptions;

create policy "platform_subscriptions_business_read"
  on public.platform_subscriptions
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1
      from public.user_roles as ur
      where ur.user_id = (select auth.uid())
        and ur.barbershop_user_id = platform_subscriptions.user_id
        and ur.role = 'barbeiro'
    )
  );
