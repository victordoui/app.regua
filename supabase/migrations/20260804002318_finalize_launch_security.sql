-- Keep the legacy table inaccessible while making the intended deny-by-default
-- posture explicit to the database security checker.
CREATE POLICY "atualizar_no_direct_access"
ON public.atualizar FOR ALL TO authenticated
USING (false)
WITH CHECK (false);

-- These functions are internal helpers invoked by database policies/triggers;
-- they must not be exposed as REST RPC endpoints to anonymous callers.
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
