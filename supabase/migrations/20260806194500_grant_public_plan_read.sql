-- The public signup screen must be able to display active subscription plans
-- before a visitor has a Supabase session. RLS still restricts the response to
-- active plans, and this migration intentionally grants no write privilege.
grant select on table public.platform_plan_config to anon, authenticated;
