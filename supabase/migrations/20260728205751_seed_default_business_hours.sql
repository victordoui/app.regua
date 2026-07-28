-- Preserve the booking screen's former 09:00-19:00 fallback as explicit data.
-- Existing schedules always win because of the unique (user_id, day_of_week) key.
insert into public.business_hours (user_id, day_of_week, open_time, close_time, is_closed)
select b.user_id, d.day_of_week, time '09:00', time '19:00', false
from public.barbershop_settings b
cross join generate_series(0, 6) as d(day_of_week)
on conflict (user_id, day_of_week) do nothing;
