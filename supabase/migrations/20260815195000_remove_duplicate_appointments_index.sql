-- Keep the original index used by appointment date lookups and remove its duplicate.
drop index if exists public.idx_appointments_user_date;
