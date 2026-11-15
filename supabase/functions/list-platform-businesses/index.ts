import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PageResult<T> = { data: T[] | null; error: { message: string } | null };
type ProfileRow = {
  id: string;
  user_id: string;
  auth_user_id: string | null;
  display_name: string | null;
  email: string | null;
  role: string | null;
  active: boolean | null;
};
type RoleRow = { user_id: string; role: string; barbershop_user_id: string | null; profile_id: string | null };

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
    if (error) throw new Error('PLATFORM_BUSINESS_DATA_UNAVAILABLE');
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
      if (error) throw new Error('PLATFORM_BUSINESS_DATA_UNAVAILABLE');
      authUsers.push(...data.users as unknown as Array<Record<string, unknown>>);
      if (data.users.length < 1000) break;
    }

    const [settings, profiles, roles, subscriptions] = await Promise.all([
      readAllPages((from, to) => admin.from('barbershop_settings')
        .select('user_id, company_name, logo_url, phone, email, share_slug, is_public_page_enabled').range(from, to)),
      readAllPages((from, to) => admin.from('profiles')
        .select('id, user_id, auth_user_id, display_name, email, role, active').range(from, to)),
      readAllPages((from, to) => admin.from('user_roles')
        .select('user_id, role, barbershop_user_id, profile_id').range(from, to)),
      readAllPages((from, to) => admin.from('platform_subscriptions')
        .select('id, user_id, plan_type, status, payment_status, start_date, end_date, created_at')
        .order('created_at', { ascending: true }).range(from, to)),
    ]);

    const settingsRows = settings as Array<Record<string, unknown> & { user_id: string; company_name: string }>;
    const profileRows = profiles as ProfileRow[];
    const roleRows = roles as RoleRow[];
    const subscriptionRows = subscriptions as Array<Record<string, unknown> & { user_id: string }>;
    const authById = new Map(authUsers.map((user) => [String(user.id), user]));
    const profileByAuthId = new Map(profileRows.filter((profile) => profile.auth_user_id)
      .map((profile) => [profile.auth_user_id as string, profile]));
    const profileById = new Map(profileRows.map((profile) => [profile.id, profile]));
    const subscriptionByOwner = new Map<string, Record<string, unknown>>();
    for (const subscription of subscriptionRows) subscriptionByOwner.set(subscription.user_id, subscription);
    const appUrl = (Deno.env.get('SITE_URL') || Deno.env.get('APP_URL') || 'https://vizzuapp.netlify.app').replace(/\/$/, '');

    const businesses = settingsRows.map((business) => {
      const ownerAuth = authById.get(business.user_id);
      const ownerProfile = profileByAuthId.get(business.user_id)
        || profileRows.find((profile) => profile.user_id === business.user_id && profile.role === 'admin');
      const ownerMetadata = (ownerAuth?.user_metadata || {}) as Record<string, unknown>;
      const linkedRoleRows = roleRows.filter((role) => role.barbershop_user_id === business.user_id && role.role !== 'cliente');
      const linkedIds = new Set([business.user_id, ...linkedRoleRows.map((role) => role.user_id)]);
      const linkedUsers = [...linkedIds].map((userId) => {
        const roleRowsForUser = linkedRoleRows.filter((role) => role.user_id === userId);
        const linkedProfile = roleRowsForUser.map((role) => role.profile_id ? profileById.get(role.profile_id) : undefined)
          .find(Boolean) || profileByAuthId.get(userId) || profileRows.find((profile) => profile.user_id === userId);
        const authUser = authById.get(userId);
        const metadata = (authUser?.user_metadata || {}) as Record<string, unknown>;
        return {
          user_id: userId,
          name: linkedProfile?.display_name || (metadata.full_name as string | undefined) || (metadata.name as string | undefined) || (userId === business.user_id ? business.company_name : 'Usuário'),
          email: (authUser?.email as string | undefined) || linkedProfile?.email || null,
          roles: userId === business.user_id ? ['admin'] : roleRowsForUser.map((role) => role.role),
        };
      });
      const businessProfessionals = profileRows.filter((profile) => profile.user_id === business.user_id && profile.role === 'barbeiro');
      const activeProfessionals = businessProfessionals.filter((profile) => profile.active !== false);
      const subscription = subscriptionByOwner.get(business.user_id);
      const effectiveStatus = subscription?.status === 'active' && subscription?.end_date
        && new Date(String(subscription.end_date)).getTime() <= Date.now() ? 'expired' : subscription?.status || 'missing';
      const slug = (business.share_slug as string | null) || business.user_id;

      return {
        user_id: business.user_id,
        company_name: business.company_name,
        logo_url: business.logo_url as string | null,
        owner_name: ownerProfile?.display_name || (ownerMetadata.full_name as string | undefined) || (ownerMetadata.name as string | undefined) || null,
        owner_email: (ownerAuth?.email as string | undefined) || ownerProfile?.email || null,
        phone: business.phone as string | null,
        email: business.email as string | null,
        plan_type: subscription?.plan_type as string | undefined || null,
        subscription_id: subscription?.id as string | undefined || null,
        status: effectiveStatus,
        end_date: subscription?.end_date as string | undefined || null,
        payment_status: subscription?.payment_status as string | undefined || null,
        professional_count: businessProfessionals.length > 0
          ? activeProfessionals.length
          : new Set(linkedRoleRows.filter((role) => role.role === 'barbeiro').map((role) => role.profile_id || role.user_id)).size,
        public_booking_url: `${appUrl}/s/${encodeURIComponent(slug)}/agendar`,
        public_page_enabled: business.is_public_page_enabled === true,
        linked_users: linkedUsers,
      };
    });

    return respond({ businesses }, 200, headers);
  } catch (error) {
    console.error('[list-platform-businesses]', error instanceof Error ? error.message : 'UNKNOWN_ERROR');
    return respond({ error: 'PLATFORM_BUSINESS_LIST_FAILED' }, 500, headers);
  }
});
