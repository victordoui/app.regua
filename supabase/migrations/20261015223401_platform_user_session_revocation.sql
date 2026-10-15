create or replace function public.revoke_platform_user_sessions(_target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.sessions where user_id = _target_user_id;
end;
$$;

revoke all on function public.revoke_platform_user_sessions(uuid) from public, anon, authenticated;
grant execute on function public.revoke_platform_user_sessions(uuid) to service_role;
