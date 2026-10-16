-- Keep the original unique idempotency index
-- (platform_payments_provider_event_id_key) and remove the later duplicate.
DROP INDEX IF EXISTS public.platform_payments_provider_event_id_unique;
