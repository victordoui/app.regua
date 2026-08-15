-- Public visitors may read active plans without evaluating the privileged
-- administrator predicate. Only authenticated users can enter the management
-- policy, which avoids permission errors for anon requests.
drop policy if exists "Super admins can manage plan configs"
on public.platform_plan_config;

create policy "Super admins can manage plan configs"
on public.platform_plan_config
for all
to authenticated
using ((select public.is_super_admin((select auth.uid()))))
with check ((select public.is_super_admin((select auth.uid()))));
