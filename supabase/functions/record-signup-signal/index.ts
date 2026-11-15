import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = [...new Set([
  ...((Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('APP_URL') || '').split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean)),
  'https://vizzuapp.netlify.app',
])];
const localOrigin = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/;
const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && (allowedOrigins.includes(origin) || localOrigin.test(origin)) ? origin : allowedOrigins[0] || 'http://127.0.0.1:8080',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});
const respond = (body: unknown, status: number, headers: Record<string, string>) => new Response(
  JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } },
);
const normalize = (value: string) => value.normalize('NFKC').trim().toLowerCase();
const hash = async (value: string | null, pepper: string) => {
  if (!value) return null;
  const bytes = new TextEncoder().encode(`${pepper}:${normalize(value)}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

serve(async (req) => {
  const headers = corsHeaders(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return respond({ error: 'METHOD_NOT_ALLOWED' }, 405, headers);
  const origin = req.headers.get('Origin');
  if (!origin || (!allowedOrigins.includes(origin.replace(/\/$/, '')) && !localOrigin.test(origin))) return respond({ error: 'ORIGIN_NOT_ALLOWED' }, 403, headers);

  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return respond({ error: 'SERVER_NOT_CONFIGURED' }, 500, headers);
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const userId = typeof body.user_id === 'string' ? body.user_id : '';
    const email = typeof body.email === 'string' ? normalize(body.email) : '';
    const fullName = typeof body.full_name === 'string' ? normalize(body.full_name).replace(/\s+/g, ' ').slice(0, 160) : '';
    const phone = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : '';
    const cpf = typeof body.cpf === 'string' ? body.cpf.replace(/\D/g, '') : '';
    const deviceId = typeof body.device_id === 'string' ? body.device_id.slice(0, 128) : '';
    if (!/^[0-9a-f-]{36}$/i.test(userId) || !email.includes('@') || email.length > 254 || (phone && phone.length > 20) || (cpf && cpf.length !== 11) || (deviceId && deviceId.length < 16)) {
      return respond({ error: 'INVALID_SIGNAL' }, 400, headers);
    }

    const admin = createClient(url, key, { auth: { persistSession: false } });
    const { data: authResult, error: authError } = await admin.auth.admin.getUserById(userId);
    if (authError || !authResult.user || normalize(authResult.user.email || '') !== email) return respond({ error: 'ACCOUNT_NOT_FOUND' }, 404, headers);
    const createdAt = Date.parse(authResult.user.created_at);
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > 15 * 60 * 1000 || createdAt > Date.now() + 60 * 1000) {
      return respond({ error: 'SIGNUP_WINDOW_EXPIRED' }, 403, headers);
    }

    const forwarded = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const ip = forwarded.trim().slice(0, 64);
    const pepper = key;
    const values = await Promise.all([
      hash(email, pepper), hash(fullName || null, pepper), hash(phone || null, pepper), hash(cpf || null, pepper), hash(deviceId || null, pepper), hash(ip || null, pepper),
    ]);
    const { error: writeError } = await admin.from('platform_signup_signals').upsert({
      user_id: userId, email_hash: values[0], name_hash: values[1], phone_hash: values[2], cpf_hash: values[3], device_hash: values[4], ip_hash: values[5],
    }, { onConflict: 'user_id' });
    if (writeError) throw new Error('SIGNAL_WRITE_FAILED');
    return respond({ ok: true }, 200, headers);
  } catch (error) {
    console.error('[record-signup-signal]', error instanceof Error ? error.message : 'UNKNOWN_ERROR');
    return respond({ error: 'SIGNAL_RECORD_FAILED' }, 500, headers);
  }
});
