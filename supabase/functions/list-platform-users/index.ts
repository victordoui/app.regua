import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PageResult<T> = { data: T[] | null; error: { message: string } | null };
type PlatformUserRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string | null;
  active: boolean | null;
  company_name: string | null;
  roles: string[];
  subscription: {
    plan_type: string;
    status: string;
    payment_status: string | null;
    start_date: string | null;
    end_date: string | null;
  } | null;
};

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
  JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  },
);

async function readAllPages<T>(loadPage: (from: number, to: number) => PromiseLike<PageResult<T>>) {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await loadPage(from, from + 999);
    if (error) throw new Error('PLATFORM_USER_DATA_UNAVAILABLE');
    const page = data || [];
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

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

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: actorRole, error: roleError } = await admin.from('user_roles').select('role')
      .eq('user_id', authData.user.id).eq('role', 'super_admin').maybeSingle();
    if (roleError || !actorRole) return respond({ error: 'NOT_ALLOWED' }, 403, headers);

    const authUsers: Array<Record<string, unknown>> = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error('PLATFORM_USER_DATA_UNAVAILABLE');
      authUsers.push(...data.users as unknown as Array<Record<string, unknown>>);
      if (data.users.length < 1000) break;
    }

    const [profiles, roles, subscriptions, businesses] = await Promise.all([
      readAllPages((from, to) => admin.from('profiles')
        .select('id, user_id, auth_user_id, display_name, email, avatar_url, created_at, active, role')
        .range(from, to)),
      readAllPages((from, to) => admin.from('user_roles').select('user_id, role').range(from, to)),
      readAllPages((from, to) => admin.from('platform_subscriptions')
        .select('user_id, plan_type, status, payment_status, start_date, end_date, created_at')
        .order('created_at', { ascending: true }).range(from, to)),
      readAllPages((from, to) => admin.from('barbershop_settings')
        .select('user_id, company_name').range(from, to)),
    ]);

    const rolesByUser = new Map<string, string[]>();
    for (const row of roles as Array<{ user_id: string; role: string }>) {
      const existing = rolesByUser.get(row.user_id) || [];
      if (!existing.includes(row.role)) existing.push(row.role);
      rolesByUser.set(row.user_id, existing);
    }
    const subscriptionByUser = new Map<string, Record<string, unknown>>();
    for (const row of subscriptions as Array<Record<string, unknown> & { user_id: string }>) {
      subscriptionByUser.set(row.user_id, row);
    }
    const businessByUser = new Map<string, string>();
    for (const row of businesses as Array<{ user_id: string; company_name: string }>) {
      businessByUser.set(row.user_id, row.company_name);
    }

    const profileRows = profiles as Array<Record<string, unknown> & {
      id: string; user_id: string; auth_user_id: string | null; role: string | null;
    }>;
    const seenIds = new Set<string>();
    const users: PlatformUserRow[] = authUsers.map((authUser) => {
      const id = String(authUser.id);
      seenIds.add(id);
      const profile = profileRows.find((row) => row.auth_user_id === id)
        || profileRows.find((row) => row.user_id === id)
        || null;
      // user_roles is the authority when assignments exist. Legacy profiles.role
      // is only a fallback for accounts that have not been migrated yet.
      const assignedRoles = rolesByUser.get(id) || [];
      const userRoles = [...assignedRoles];
      if (userRoles.length === 0 && profile?.role) userRoles.push(profile.role);
      const metadata = (authUser.user_metadata || {}) as Record<string, unknown>;
      const subscription = subscriptionByUser.get(id);
      return {
        id: profile?.id || id,
        user_id: id,
        display_name: (profile?.display_name as string | null) || (metadata.full_name as string | undefined) || (metadata.name as string | undefined) || null,
        email: (authUser.email as string | undefined) || (profile?.email as string | null) || null,
        avatar_url: (profile?.avatar_url as string | null) || (metadata.avatar_url as string | undefined) || (metadata.picture as string | undefined) || null,
        created_at: (profile?.created_at as string | null) || (authUser.created_at as string | undefined) || null,
        active: (profile?.active as boolean | null | undefined) ?? true,
        company_name: businessByUser.get(id) || null,
        roles: userRoles,
        subscription: subscription ? {
          plan_type: subscription.plan_type as string,
          status: subscription.status as string,
          payment_status: subscription.payment_status as string | null,
          start_date: subscription.start_date as string | null,
          end_date: subscription.end_date as string | null,
        } : null,
      };
    });

    // Keep profile records visible too when they no longer have an Auth identity.
    for (const profile of profileRows) {
      const identity = profile.auth_user_id || profile.user_id;
      if (seenIds.has(identity)) continue;
      seenIds.add(identity);
      const assignedRoles = rolesByUser.get(identity) || [];
      users.push({
        id: profile.id,
        user_id: identity,
        display_name: profile.display_name as string | null,
        email: profile.email as string | null,
        avatar_url: profile.avatar_url as string | null,
        created_at: profile.created_at as string | null,
        active: profile.active as boolean | null,
        company_name: businessByUser.get(identity) || null,
        roles: assignedRoles.length ? assignedRoles : (profile.role ? [profile.role] : []),
        subscription: (() => {
          const subscription = subscriptionByUser.get(identity);
          return subscription ? {
            plan_type: subscription.plan_type as string,
            status: subscription.status as string,
            payment_status: subscription.payment_status as string | null,
            start_date: subscription.start_date as string | null,
            end_date: subscription.end_date as string | null,
          } : null;
        })(),
      });
    }

    return respond({ users }, 200, headers);
  } catch (error) {
    console.error('[list-platform-users]', error instanceof Error ? error.message : 'UNKNOWN_ERROR');
    return respond({ error: 'PLATFORM_USER_LIST_FAILED' }, 500, headers);
  }
});
