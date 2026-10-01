begin;
create table public.tv_display_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  config jsonb not null default '{"headline":"Seja bem-vindo!","ticker":"","slides":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint tv_config_object check (jsonb_typeof(config) = 'object')
);
alter table public.tv_display_settings enable row level security;
revoke all on public.tv_display_settings from anon;
grant select, insert, update on public.tv_display_settings to authenticated;
create policy "Business owner manages TV" on public.tv_display_settings
  for all to authenticated
  using (user_id = (select auth.uid()) and public.has_role(auth.uid(), 'admin'))
  with check (user_id = (select auth.uid()) and public.has_role(auth.uid(), 'admin'));
commit;
