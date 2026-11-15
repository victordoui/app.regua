alter table public.platform_plan_config
  add column if not exists stripe_price_yearly_id text;

create unique index if not exists platform_plan_config_stripe_price_yearly_id_unique
  on public.platform_plan_config (stripe_price_yearly_id)
  where stripe_price_yearly_id is not null;

-- Approved launch catalog. Appointment quotas use a high internal ceiling;
-- public UI treats these plans as unlimited.
update public.platform_plan_config
set display_name = 'Teste grátis',
    price_monthly = 0,
    price_yearly = null,
    max_barbers = 6,
    max_appointments_month = 1000000,
    trial_days = 7,
    features = '{"basic_scheduling":true,"client_management":true,"services":true,"public_booking":true,"reminders_600":true,"basic_reports":true,"complete_reports":true,"commissions":true,"pix_deposit":true,"loyalty":true,"campaigns":true,"stock":true,"client_subscription_club":false,"white_label":false,"multi_location":false,"priority_support":false}'::jsonb,
    sort_order = 0,
    updated_at = now()
where plan_type = 'trial';

update public.platform_plan_config
set display_name = 'Essencial',
    price_monthly = 44.90,
    price_yearly = 449,
    max_barbers = 2,
    max_appointments_month = 1000000,
    trial_days = 7,
    features = '{"basic_scheduling":true,"client_management":true,"services":true,"public_booking":true,"reminders_150":true,"basic_reports":true,"complete_reports":false,"commissions":false,"pix_deposit":false,"loyalty":false,"campaigns":false,"stock":false,"client_subscription_club":false,"white_label":false,"multi_location":false,"priority_support":false}'::jsonb,
    sort_order = 1,
    stripe_price_id = null,
    stripe_price_yearly_id = null,
    updated_at = now()
where plan_type = 'basic';

update public.platform_plan_config
set display_name = 'Profissional',
    price_monthly = 89.90,
    price_yearly = 899,
    max_barbers = 6,
    max_appointments_month = 1000000,
    trial_days = 7,
    features = '{"basic_scheduling":true,"client_management":true,"services":true,"public_booking":true,"reminders_600":true,"basic_reports":true,"complete_reports":true,"commissions":true,"pix_deposit":true,"loyalty":true,"campaigns":true,"stock":true,"client_subscription_club":false,"white_label":false,"multi_location":false,"priority_support":false}'::jsonb,
    sort_order = 2,
    stripe_price_id = null,
    stripe_price_yearly_id = null,
    updated_at = now()
where plan_type = 'pro';

update public.platform_plan_config
set display_name = 'Premium',
    price_monthly = 149.90,
    price_yearly = 1499,
    max_barbers = 15,
    max_appointments_month = 1000000,
    trial_days = 7,
    features = '{"basic_scheduling":true,"client_management":true,"services":true,"public_booking":true,"reminders_2000":true,"basic_reports":true,"complete_reports":true,"commissions":true,"pix_deposit":true,"loyalty":true,"campaigns":true,"stock":true,"client_subscription_club":false,"white_label":false,"multi_location":false,"priority_support":true}'::jsonb,
    sort_order = 3,
    stripe_price_id = null,
    stripe_price_yearly_id = null,
    updated_at = now()
where plan_type = 'enterprise';
