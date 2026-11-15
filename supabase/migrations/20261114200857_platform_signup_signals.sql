-- Risk signals are hashed at collection and are available only to service_role.
create table if not exists public.platform_signup_signals (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_hash text not null,
  name_hash text,
  phone_hash text,
  cpf_hash text,
  device_hash text,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.platform_signup_signals add column if not exists name_hash text;
create index if not exists idx_platform_signup_signals_email on public.platform_signup_signals (email_hash);
create index if not exists idx_platform_signup_signals_name on public.platform_signup_signals (name_hash) where name_hash is not null;
create index if not exists idx_platform_signup_signals_phone on public.platform_signup_signals (phone_hash) where phone_hash is not null;
create index if not exists idx_platform_signup_signals_cpf on public.platform_signup_signals (cpf_hash) where cpf_hash is not null;
create index if not exists idx_platform_signup_signals_device on public.platform_signup_signals (device_hash) where device_hash is not null;
create index if not exists idx_platform_signup_signals_ip_created on public.platform_signup_signals (ip_hash, created_at desc) where ip_hash is not null;

alter table public.platform_signup_signals enable row level security;
revoke all on public.platform_signup_signals from anon, authenticated;
grant all on public.platform_signup_signals to service_role;
