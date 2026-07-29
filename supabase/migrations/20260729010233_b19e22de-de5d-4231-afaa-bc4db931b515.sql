GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_client_of(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_subscriber_with_subscription(uuid, text, text, text, text) TO authenticated;