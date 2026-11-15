import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PageResult<T> = { data: T[] | null; error: { message: string } | null };
type SignalRow = { user_id: string; email_hash: string; name_hash: string | null; phone_hash: string | null; cpf_hash: string | null; device_hash: string | null; ip_hash: string | null; created_at: string };
type ProfileRow = { user_id: string; auth_user_id: string | null; display_name: string | null; email: string | null; phone: string | null; role: string | null };
type SubscriptionRow = { id: string; user_id: string; plan_type: string; status: string; created_at: string; end_date: string | null };

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

async function readAllPages<T>(loadPage: (from: number, to: number) => PromiseLike<PageResult<T>>) {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await loadPage(from, from + 999);
    if (error) throw new Error('FRAUD_DATA_UNAVAILABLE');
    const page = data || [];
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

const hash = async (value: string, pepper: string): Promise<string | null> => {
  const normalized = value.normalize('NFKC').replace(/\D/g, '');
  if (!normalized) return null;
  const bytes = new TextEncoder().encode(`${pepper}:${normalized}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

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
    const auth = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: authData, error: authError } = await auth.auth.getUser();
    if (authError || !authData.user) return respond({ error: 'AUTH_REQUIRED' }, 401, headers);
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: superAdmin, error: roleError } = await admin.from('user_roles').select('role').eq('user_id', authData.user.id).eq('role', 'super_admin').maybeSingle();
    if (roleError || !superAdmin) return respond({ error: 'NOT_ALLOWED' }, 403, headers);

    const [signals, profiles, subscriptions, settings, clientProfiles] = await Promise.all([
      readAllPages((from, to) => admin.from('platform_signup_signals').select('user_id,email_hash,name_hash,phone_hash,cpf_hash,device_hash,ip_hash,created_at').range(from, to)),
      readAllPages((from, to) => admin.from('profiles').select('user_id,auth_user_id,display_name,email,phone,role').range(from, to)),
      readAllPages((from, to) => admin.from('platform_subscriptions').select('id,user_id,plan_type,status,created_at,end_date').range(from, to)),
      readAllPages((from, to) => admin.from('barbershop_settings').select('user_id,company_name').range(from, to)),
      readAllPages((from, to) => admin.from('client_profiles').select('user_id,cpf,phone,created_at').not('cpf','is',null).range(from, to)),
    ]);

    const signalRows = signals as SignalRow[];
    const profileRows = profiles as ProfileRow[];
    const subscriptionRows = subscriptions as SubscriptionRow[];
    const subscriptionByUser = new Map(subscriptionRows.map((row) => [row.user_id, row]));
    const settingsByUser = new Map((settings as Array<{ user_id: string; company_name: string }>).map((row) => [row.user_id, row.company_name]));
    const users = new Map<string, { user_id: string; name: string; email: string | null; company_name: string | null; subscription_id: string | null; created_at: string | null }>();
    const authUsers: Array<{ id: string; email?: string; created_at: string; user_metadata?: Record<string, unknown> }> = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error('FRAUD_USER_DIRECTORY_UNAVAILABLE');
      authUsers.push(...data.users as unknown as typeof authUsers);
      if (data.users.length < 1000) break;
    }
    for (const user of authUsers) {
      const profile = profileRows.find((row) => row.auth_user_id === user.id || row.user_id === user.id);
      const subscription = subscriptionByUser.get(user.id);
      users.set(user.id, {
        user_id: user.id,
        name: profile?.display_name || settingsByUser.get(user.id) || String(user.user_metadata?.full_name || 'Usuário'),
        email: user.email || profile?.email || null,
        company_name: settingsByUser.get(user.id) || null,
        subscription_id: subscription?.id || null,
        created_at: user.created_at || null,
      });
    }

    type Alert = { id: string; type: string; title: string; description: string; severity: 'high' | 'medium'; users: Array<{ user_id: string; name: string; email: string | null; company_name: string | null; subscription_id: string | null }> };
    const alerts: Alert[] = [];
    const addGrouped = (type: string, title: string, field: keyof SignalRow, candidates: SignalRow[], severity: 'high' | 'medium') => {
      const groups = new Map<string, Set<string>>();
      for (const signal of candidates) {
        const value = signal[field];
        if (typeof value !== 'string' || !value) continue;
        const ids = groups.get(value) || new Set<string>();
        ids.add(signal.user_id);
        groups.set(value, ids);
      }
      for (const [valueHash, ids] of groups) {
        if (ids.size < 2) continue;
        const affected = [...ids].map((id) => users.get(id)).filter((user): user is NonNullable<typeof user> => Boolean(user));
        if (affected.length < 2) continue;
        alerts.push({
          id: `${type}:${valueHash.slice(0, 14)}`, type, title,
          description: `${affected.length} contas compartilham um identificador. Revise antes de tomar qualquer ação.`, severity,
          users: affected,
        });
      }
    };

    const uniqueSignals = [...new Map(signalRows.map((row) => [row.user_id, row])).values()];
    addGrouped('duplicate_email', 'E-mail repetido', 'email_hash', uniqueSignals, 'medium');
    addGrouped('duplicate_phone', 'Telefone repetido', 'phone_hash', uniqueSignals, 'medium');
    addGrouped('duplicate_cpf', 'CPF repetido', 'cpf_hash', uniqueSignals, 'high');

    const clientCpfRows = clientProfiles as Array<{ user_id: string; cpf: string | null; phone: string | null; created_at: string | null }>;
    const clientCpfHashes = await Promise.all(clientCpfRows.map((row) => hash(row.cpf || '', serviceKey)));
    const cpfByUser = new Map<string, Set<string>>();
    clientCpfHashes.forEach((cpfHash, index) => {
      const id = clientCpfRows[index]?.user_id;
      if (!cpfHash || !id) return;
      const owners = cpfByUser.get(cpfHash) || new Set<string>();
      owners.add(id);
      cpfByUser.set(cpfHash, owners);
    });
    for (const [cpfHash, ids] of cpfByUser) {
      if (ids.size < 2) continue;
      const affected = [...ids].map((id) => users.get(id)).filter((user): user is NonNullable<typeof user> => Boolean(user));
      if (affected.length < 2) continue;
      alerts.push({ id: `duplicate_client_cpf:${cpfHash.slice(0,14)}`, type: 'duplicate_cpf', title: 'CPF repetido', description: `${affected.length} contas de cliente usam o mesmo CPF. Revise antes de tomar qualquer ação.`, severity: 'high', users: affected });
    }

    const trialOwners = new Set(subscriptionRows.filter((row) => row.plan_type === 'trial' && row.status === 'active' && (!row.end_date || Date.parse(row.end_date) > Date.now())).map((row) => row.user_id));
    const trialSignals = uniqueSignals.filter((row) => trialOwners.has(row.user_id));
    addGrouped('multiple_trials_person', 'Múltiplos testes pela mesma pessoa', 'name_hash', trialSignals, 'high');
    addGrouped('multiple_trials_phone', 'Múltiplos testes pelo mesmo telefone', 'phone_hash', trialSignals, 'high');
    addGrouped('multiple_trials_device', 'Múltiplos testes pelo mesmo dispositivo', 'device_hash', trialSignals, 'high');
    addGrouped('multiple_trials_email', 'Múltiplos testes pelo mesmo e-mail', 'email_hash', trialSignals, 'high');

    const ipGroups = new Map<string, SignalRow[]>();
    for (const signal of uniqueSignals) {
      if (!signal.ip_hash || !signal.created_at) continue;
      const group = ipGroups.get(signal.ip_hash) || [];
      group.push(signal);
      ipGroups.set(signal.ip_hash, group);
    }
    const now = Date.now();
    for (const [ipHash, group] of ipGroups) {
      const recent = group.filter((row) => now - Date.parse(row.created_at) <= 90 * 24 * 60 * 60 * 1000)
        .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
      for (let start = 0; start < recent.length; start += 1) {
        const windowRows = recent.slice(start).filter((row) => Date.parse(row.created_at) - Date.parse(recent[start].created_at) <= 15 * 60 * 1000);
        const ids = new Set(windowRows.map((row) => row.user_id));
        if (ids.size < 3) continue;
        const affected = [...ids].map((id) => users.get(id)).filter((user): user is NonNullable<typeof user> => Boolean(user));
        if (affected.length < 3) continue;
        alerts.push({ id: `signup_ip:${ipHash.slice(0,14)}:${recent[start].created_at}`, type: 'sequential_signups_ip', title: 'Várias contas criadas em sequência pelo mesmo IP', description: `${affected.length} contas foram registradas em até 15 minutos. O IP foi guardado apenas como hash.`, severity: 'high', users: affected });
        break;
      }
    }

    const sortedAlerts = alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'high' ? -1 : 1));
    return respond({ alerts: sortedAlerts, signal_coverage: { signup_signals: uniqueSignals.length, ip_signals: uniqueSignals.filter((row) => row.ip_hash).length, device_signals: uniqueSignals.filter((row) => row.device_hash).length } }, 200, headers);
  } catch (error) {
    console.error('[list-platform-fraud-alerts]', error instanceof Error ? error.message : 'UNKNOWN_ERROR');
    return respond({ error: 'FRAUD_ALERTS_UNAVAILABLE' }, 500, headers);
  }
});
