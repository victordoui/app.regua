-- `is_client_of` is an internal SECURITY DEFINER helper. It is not part of
-- the public booking contract and exposing it lets unauthenticated callers
-- probe whether a user belongs to a business.
revoke all on function public.is_client_of(uuid, uuid) from public, anon, authenticated;
