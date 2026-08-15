-- A business owns many professional profiles. The legacy unique(user_id)
-- constraint made the second team member impossible to create.
alter table public.pricing_rules
  drop constraint if exists pricing_rules_barber_id_fkey;

alter table public.profiles
  drop constraint if exists profiles_user_id_key;

alter table public.pricing_rules
  add constraint pricing_rules_barber_id_fkey
  foreign key (barber_id)
  references public.profiles(id)
  on delete cascade;

create index if not exists profiles_business_role_active_idx
  on public.profiles (user_id, role, active);
