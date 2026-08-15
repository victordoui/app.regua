-- Gallery and review management is tenant-private. No active public route
-- consumes these tables, so do not expose every business' content anonymously.
drop policy if exists "Public can view gallery" on public.gallery;
drop policy if exists "Users can manage their gallery" on public.gallery;
create policy "Users can manage their gallery" on public.gallery for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Public can view reviews by barbershop" on public.reviews;
drop policy if exists "Users can insert reviews" on public.reviews;
drop policy if exists "Users can view their own reviews" on public.reviews;
create policy "Users can insert reviews" on public.reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can view their own reviews" on public.reviews for select to authenticated using ((select auth.uid()) = user_id);

revoke select on table public.gallery, public.reviews from anon;
