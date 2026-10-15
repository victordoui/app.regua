alter table public.platform_plan_config
  add column if not exists stripe_price_id text;

create unique index if not exists platform_plan_config_stripe_price_id_unique
  on public.platform_plan_config (stripe_price_id)
  where stripe_price_id is not null;

update public.platform_plan_config
set stripe_price_id = case plan_type
  when 'basic' then 'price_1Sxv8YLLAa7XPFh3cwA1YeWW'
  when 'pro' then 'price_1Sxv9ULLAa7XPFh3iVH7F5OQ'
  when 'enterprise' then 'price_1Sxv9iLLAa7XPFh3q4j2PU7x'
  else null
end
where plan_type in ('basic', 'pro', 'enterprise');

alter table public.platform_payments
  add column if not exists provider_event_id text;

create unique index if not exists platform_payments_provider_event_id_unique
  on public.platform_payments (provider_event_id)
  where provider_event_id is not null;
