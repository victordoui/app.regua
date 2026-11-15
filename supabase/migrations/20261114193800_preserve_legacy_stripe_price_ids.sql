-- Keep the existing Stripe product reachable while the approved catalog
-- replaces its old monthly Price IDs with prices at the new amounts.
alter table public.platform_plan_config
  add column if not exists stripe_price_legacy_id text;

update public.platform_plan_config
set stripe_price_legacy_id = stripe_price_id
where stripe_price_legacy_id is null
  and stripe_price_id is not null;
