-- Keep the public booking directory physically separate from private profile data.
-- A view over profiles runs as its creator by default and would bypass profile RLS.
drop view if exists public.professional_directory;

create table if not exists public.professional_directory (
  id uuid primary key,
  user_id uuid not null,
  display_name text,
  avatar_url text,
  specializations text[] not null default '{}'
);

alter table public.professional_directory enable row level security;

revoke all on public.professional_directory from public;
grant select on public.professional_directory to anon, authenticated;

drop policy if exists "Public professionals are discoverable" on public.professional_directory;
create policy "Public professionals are discoverable"
on public.professional_directory
for select
to anon, authenticated
using (true);

insert into public.professional_directory (id, user_id, display_name, avatar_url, specializations)
select id, user_id, display_name, avatar_url, coalesce(specializations, '{}')
from public.profiles
where role = 'barbeiro'
  and active = true
on conflict (id) do update
set user_id = excluded.user_id,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    specializations = excluded.specializations;

create or replace function public.sync_professional_directory()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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
$$;

revoke all on function public.sync_professional_directory() from public, anon, authenticated;

drop trigger if exists sync_professional_directory_after_change on public.profiles;
create trigger sync_professional_directory_after_change
after insert or update of user_id, display_name, avatar_url, specializations, role, active or delete
on public.profiles
for each row execute function public.sync_professional_directory();
