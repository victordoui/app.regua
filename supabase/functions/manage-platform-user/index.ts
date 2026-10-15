import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PlatformUserAction = 'suspend' | 'activate' | 'ban' | 'unban' | 'revoke_sessions' | 'delete';

interface ManagePlatformUserRequest {
  action: PlatformUserAction;
  target_user_id: string;
  confirmation?: string;
}

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('APP_URL') || '')
  .split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && (allowedOrigins.includes(origin) || /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin))
    ? origin : allowedOrigins[0] || 'http://127.0.0.1:8080',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const respond = (body: unknown, status: number, headers: Record<string, string>) => new Response(
  JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } },
);

serve(async (req) => {
  const headers = corsHeaders(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return respond({ error: 'METHOD_NOT_ALLOWED' }, 405, headers);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = req.headers.get('Authorization');
    if (!supabaseUrl || !anonKey || !serviceKey) return respond({ error: 'SERVER_NOT_CONFIGURED' }, 500, headers);
    if (!authHeader) return respond({ error: 'AUTH_REQUIRED' }, 401, headers);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }, auth: { persistSession: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) return respond({ error: 'AUTH_REQUIRED' }, 401, headers);

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const actorId = authData.user.id;
    const { data: actorRole } = await adminClient.from('user_roles').select('role')
      .eq('user_id', actorId).eq('role', 'super_admin').maybeSingle();
    if (!actorRole) return respond({ error: 'NOT_ALLOWED' }, 403, headers);

    const payload = await req.json() as ManagePlatformUserRequest;
    const actions: PlatformUserAction[] = ['suspend', 'activate', 'ban', 'unban', 'revoke_sessions', 'delete'];
    if (!actions.includes(payload.action) || !/^[0-9a-f-]{36}$/i.test(payload.target_user_id || '')) {
      return respond({ error: 'INVALID_REQUEST' }, 400, headers);
    }
    if (payload.target_user_id === actorId) return respond({ error: 'SELF_MANAGEMENT_NOT_ALLOWED' }, 409, headers);

    const { data: targetRole } = await adminClient.from('user_roles').select('role')
      .eq('user_id', payload.target_user_id).eq('role', 'super_admin').maybeSingle();
    if (targetRole) return respond({ error: 'SUPER_ADMIN_TARGET_PROTECTED' }, 409, headers);

    const { data: targetAuth, error: targetError } = await adminClient.auth.admin.getUserById(payload.target_user_id);
    if (targetError || !targetAuth.user) return respond({ error: 'USER_NOT_FOUND' }, 404, headers);

    let auditAction = '';
    const details: Record<string, unknown> = { source: 'manage-platform-user' };

    if (payload.action === 'suspend' || payload.action === 'activate') {
      const nextStatus = payload.action === 'suspend' ? 'suspended' : 'active';
      const { error } = await adminClient.from('platform_subscriptions')
        .update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('user_id', payload.target_user_id);
      if (error) throw error;
      auditAction = payload.action === 'suspend' ? 'suspend_subscription' : 'activate_subscription';
      details.status = nextStatus;
    }

    if (payload.action === 'ban' || payload.action === 'unban') {
      const { error } = await adminClient.auth.admin.updateUserById(payload.target_user_id, {
        ban_duration: payload.action === 'ban' ? '876000h' : 'none',
      });
      if (error) throw error;
      await adminClient.from('profiles').update({ active: payload.action === 'unban' })
        .or(`auth_user_id.eq.${payload.target_user_id},user_id.eq.${payload.target_user_id}`);
      if (payload.action === 'ban') {
        await adminClient.from('platform_subscriptions')
          .update({ status: 'suspended', updated_at: new Date().toISOString() }).eq('user_id', payload.target_user_id);
      }
      auditAction = payload.action === 'ban' ? 'ban_user' : 'unban_user';
      details.banned = payload.action === 'ban';
    }

    if (payload.action === 'revoke_sessions') {
      const { error } = await adminClient.rpc('revoke_platform_user_sessions', { _target_user_id: payload.target_user_id });
      if (error) throw error;
      auditAction = 'revoke_sessions';
    }

    if (payload.action === 'delete') {
      const targetEmail = targetAuth.user.email?.trim().toLowerCase() || '';
      if (!targetEmail || payload.confirmation?.trim().toLowerCase() !== targetEmail) {
        return respond({ error: 'EMAIL_CONFIRMATION_REQUIRED' }, 409, headers);
      }
      await adminClient.from('platform_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('user_id', payload.target_user_id);
      await adminClient.from('profiles').update({ active: false })
        .or(`auth_user_id.eq.${payload.target_user_id},user_id.eq.${payload.target_user_id}`);

      auditAction = 'delete_user';
      details.email = targetEmail;
      details.mode = 'auth_identity_deleted_business_data_retained';
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(payload.target_user_id, false);
      if (deleteError) throw deleteError;
      const { error: auditError } = await adminClient.from('platform_audit_logs').insert({
        super_admin_id: actorId, action: auditAction, target_user_id: payload.target_user_id, details,
      });
      if (auditError) throw auditError;
      return respond({ success: true, action: payload.action }, 200, headers);
    }

    const { error: auditError } = await adminClient.from('platform_audit_logs').insert({
      super_admin_id: actorId, action: auditAction, target_user_id: payload.target_user_id, details,
    });
    if (auditError) throw auditError;
    return respond({ success: true, action: payload.action }, 200, headers);
  } catch (error) {
    console.error('[manage-platform-user]', error instanceof Error ? error.message : String(error));
    return respond({ error: 'PLATFORM_USER_OPERATION_FAILED' }, 500, corsHeaders(req.headers.get('Origin')));
  }
});
