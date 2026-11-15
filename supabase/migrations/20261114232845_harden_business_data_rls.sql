-- Remove cross-tenant write/read policies that were created for every
-- authenticated user. Keep the business owner and staff tenant policies.
drop policy if exists "Authenticated users can update settings"
  on public.barbershop_settings;
drop policy if exists "Owners can update their settings"
  on public.barbershop_settings;
drop policy if exists "Owners can insert their settings"
  on public.barbershop_settings;

create policy "Owners can update their settings"
  on public.barbershop_settings
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owners can insert their settings"
  on public.barbershop_settings
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Authenticated users can insert clients"
  on public.clients;
drop policy if exists "Authenticated users can update clients"
  on public.clients;
drop policy if exists "Authenticated users can view clients"
  on public.clients;

drop policy if exists "Authenticated users can manage services"
  on public.services;
