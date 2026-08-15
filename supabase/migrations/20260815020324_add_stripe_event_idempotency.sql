alter table public.platform_payments
  add column if not exists provider_event_id text;

create unique index if not exists platform_payments_provider_event_id_key
  on public.platform_payments(provider_event_id)
  where provider_event_id is not null;
