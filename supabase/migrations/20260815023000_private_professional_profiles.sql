-- Anonymous booking pages need a public directory, not the complete profile
-- row (which also contains phone, email and private notes).
create or replace view public.professional_directory
with (security_barrier = true)
as
select
  id,
  user_id,
  display_name,
  avatar_url,
  specializations
from public.profiles
where role = 'barbeiro'
  and active = true;

revoke all on public.professional_directory from public;
grant select on public.professional_directory to anon, authenticated;

drop policy if exists profiles_public_professional_read on public.profiles;
