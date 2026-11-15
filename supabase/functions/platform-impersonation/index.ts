import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = [...new Set([
  ...((Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('APP_URL') || '').split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean)),
  'https://vizzuapp.netlify.app',
])];
const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && (allowedOrigins.includes(origin) || /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin))
    ? origin : allowedOrigins[0] || 'http://127.0.0.1:8080',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});
const respond = (body: unknown, status: number, headers: Record<string, string>) => new Response(
  JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } },
);

serve(async (req) => {
  const headers = corsHeaders(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return respond({ error: 'METHOD_NOT_ALLOWED' }, 405, headers);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authorization = req.headers.get('Authorization');
    if (!supabaseUrl || !anonKey || !serviceKey) return respond({ error: 'SERVER_NOT_CONFIGURED' }, 500, headers);
    if (!authorization) return respond({ error: 'AUTH_REQUIRED' }, 401, headers);

    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) return respond({ error: 'AUTH_REQUIRED' }, 401, headers);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: actorRole, error: actorRoleError } = await admin.from('user_roles').select('role')
      .eq('user_id', authData.user.id).eq('role', 'super_admin').maybeSingle();
    if (actorRoleError || !actorRole) return respond({ error: 'NOT_ALLOWED' }, 403, headers);

    const body = await req.json().catch(() => ({})) as { action?: string; target_user_id?: string };
    const targetId = body.target_user_id || '';
    if (!['start', 'end'].includes(body.action || '') || !/^[0-9a-f-]{36}$/i.test(targetId)) {
      return respond({ error: 'INVALID_REQUEST' }, 400, headers);
    }
    if (targetId === authData.user.id) return respond({ error: 'INVALID_TARGET' }, 400, headers);

    const [{ data: targetRole, error: targetRoleError }, { data: business, error: businessError }] = await Promise.all([
      admin.from('user_roles').select('role').eq('user_id', targetId).eq('role', 'admin').maybeSingle(),
      admin.from('barbershop_settings').select('company_name').eq('user_id', targetId).maybeSingle(),
    ]);
    if (targetRoleError || businessError) return respond({ error: 'TARGET_LOOKUP_FAILED' }, 500, headers);
    if (!targetRole || !business) return respond({ error: 'BUSINESS_OWNER_NOT_FOUND' }, 404, headers);

    if (body.action === 'end') {
      const { error: auditError } = await admin.from('platform_audit_logs').insert({
        super_admin_id: authData.user.id,
        target_user_id: targetId,
        action: 'impersonation_ended',
        details: { company_name: business.company_name },
      });
      if (auditError) return respond({ error: 'AUDIT_WRITE_FAILED' }, 500, headers);
      return respond({ ok: true }, 200, headers);
    }

    const { data: targetAuth, error: targetAuthError } = await admin.auth.admin.getUserById(targetId);
    if (targetAuthError || !targetAuth.user?.email || targetAuth.user.banned_until) {
      return respond({ error: 'TARGET_UNAVAILABLE' }, 404, headers);
    }
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email: targetAuth.user.email });
    if (linkError || !link.properties.hashed_token) return respond({ error: 'TOKEN_GENERATION_FAILED' }, 500, headers);

    const { error: auditError } = await admin.from('platform_audit_logs').insert({
      super_admin_id: authData.user.id,
      target_user_id: targetId,
      action: 'impersonation_started',
      details: { company_name: business.company_name },
    });
    if (auditError) return respond({ error: 'AUDIT_WRITE_FAILED' }, 500, headers);

    return respond({ token_hash: link.properties.hashed_token, company_name: business.company_name }, 200, headers);
  } catch (error) {
    console.error('[platform-impersonation]', error instanceof Error ? error.message : 'UNKNOWN_ERROR');
    return respond({ error: 'IMPERSONATION_FAILED' }, 500, headers);
  }
});
