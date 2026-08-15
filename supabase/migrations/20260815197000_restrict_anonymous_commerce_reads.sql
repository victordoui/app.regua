-- Coupons, loyalty rewards and service combos are consumed after client login.
-- Keep active-item discovery for authenticated users while removing anonymous access.
drop policy if exists "Public can view active coupons" on public.discount_coupons;
create policy "Authenticated users can view active coupons" on public.discount_coupons for select to authenticated using (active = true);
drop policy if exists "Users can manage their coupons" on public.discount_coupons;
create policy "Users can manage their coupons" on public.discount_coupons for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Public can view active rewards" on public.loyalty_rewards;
create policy "Authenticated users can view active rewards" on public.loyalty_rewards for select to authenticated using (active = true);
drop policy if exists "Users can manage their rewards" on public.loyalty_rewards;
create policy "Users can manage their rewards" on public.loyalty_rewards for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Public can view active combos" on public.service_combos;
create policy "Authenticated users can view active combos" on public.service_combos for select to authenticated using (active = true);
drop policy if exists "Users can delete their own combos" on public.service_combos;
create policy "Users can delete their own combos" on public.service_combos for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert their own combos" on public.service_combos;
create policy "Users can insert their own combos" on public.service_combos for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own combos" on public.service_combos;
create policy "Users can update their own combos" on public.service_combos for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can view their own combos" on public.service_combos;
create policy "Users can view their own combos" on public.service_combos for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Public can view active combo items" on public.service_combo_items;
create policy "Authenticated users can view active combo items" on public.service_combo_items for select to authenticated using (exists (select 1 from public.service_combos where service_combos.id = service_combo_items.combo_id and service_combos.active = true));
drop policy if exists "Users can delete own combo items" on public.service_combo_items;
create policy "Users can delete own combo items" on public.service_combo_items for delete to authenticated using (exists (select 1 from public.service_combos where service_combos.id = service_combo_items.combo_id and service_combos.user_id = (select auth.uid())));
drop policy if exists "Users can insert own combo items" on public.service_combo_items;
create policy "Users can insert own combo items" on public.service_combo_items for insert to authenticated with check (exists (select 1 from public.service_combos where service_combos.id = service_combo_items.combo_id and service_combos.user_id = (select auth.uid())));
drop policy if exists "Users can update own combo items" on public.service_combo_items;
create policy "Users can update own combo items" on public.service_combo_items for update to authenticated using (exists (select 1 from public.service_combos where service_combos.id = service_combo_items.combo_id and service_combos.user_id = (select auth.uid()))) with check (exists (select 1 from public.service_combos where service_combos.id = service_combo_items.combo_id and service_combos.user_id = (select auth.uid())));
drop policy if exists "Users can view own combo items" on public.service_combo_items;
create policy "Users can view own combo items" on public.service_combo_items for select to authenticated using (exists (select 1 from public.service_combos where service_combos.id = service_combo_items.combo_id and service_combos.user_id = (select auth.uid())));

revoke select on table public.discount_coupons, public.loyalty_rewards, public.service_combos, public.service_combo_items from anon;
