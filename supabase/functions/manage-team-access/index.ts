import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type TeamRole = 'barbeiro';

interface TeamRequest {
  action: 'invite' | 'update' | 'set_active';
  profile_id?: string;
  display_name?: string;
  email?: string;
  role?: TeamRole;
  active?: boolean;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = req.headers.get('Authorization');
    if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: 'SERVER_NOT_CONFIGURED' }, 500);
    if (!authHeader) return json({ error: 'AUTH_REQUIRED' }, 401);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) return json({ error: 'AUTH_REQUIRED' }, 401);

    const ownerId = authData.user.id;
    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Team administration is limited to the business owner. Staff admins can
    // receive access to modules, but cannot create identities for another tenant.
    const { data: business } = await adminClient
      .from('barbershop_settings')
      .select('user_id')
      .eq('user_id', ownerId)
      .maybeSingle();
    const { data: ownerRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', ownerId)
      .in('role', ['admin', 'super_admin'])
      .limit(1)
      .maybeSingle();

    if (!business || !ownerRole) return json({ error: 'NOT_ALLOWED' }, 403);

    const payload = await req.json() as TeamRequest;
    if (!['invite', 'update', 'set_active'].includes(payload.action)) {
      return json({ error: 'INVALID_ACTION' }, 400);
    }

    if (payload.action === 'invite') {
      const name = payload.display_name?.trim() || '';
      const email = payload.email?.trim().toLowerCase() || '';
      const role = payload.role;
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || role !== 'barbeiro') {
        return json({ error: 'INVALID_TEAM_MEMBER' }, 400);
      }

      const { data: duplicate } = await adminClient
        .from('profiles')
        .select('id, auth_user_id')
        .eq('user_id', ownerId)
        .ilike('email', email)
        .maybeSingle();
      if (duplicate?.auth_user_id) return json({ error: 'EMAIL_ALREADY_IN_TEAM' }, 409);

      const appUrl = Deno.env.get('APP_URL');
      const inviteOptions: { data: Record<string, string>; redirectTo?: string } = {
        data: {
          full_name: name,
          account_type: 'staff',
          barbershop_user_id: ownerId,
        },
      };
      if (appUrl) inviteOptions.redirectTo = `${appUrl.replace(/\/$/, '')}/login`;

      const { data: inviteData, error: inviteError } = await adminClient.auth.admin
        .inviteUserByEmail(email, inviteOptions);
      if (inviteError || !inviteData.user) {
        const message = inviteError?.message?.toLowerCase() || '';
        return json({ error: message.includes('already') ? 'EMAIL_ALREADY_REGISTERED' : 'INVITE_FAILED' }, 409);
      }

      const invitedUserId = inviteData.user.id;
      const profileQuery = duplicate
        ? adminClient
            .from('profiles')
            .update({ auth_user_id: invitedUserId, display_name: name, email, role, active: true })
            .eq('id', duplicate.id)
            .eq('user_id', ownerId)
        : adminClient
            .from('profiles')
            .insert({
              user_id: ownerId,
              auth_user_id: invitedUserId,
              display_name: name,
              email,
              role,
              active: true,
            });
      const { data: profile, error: profileError } = await profileQuery
        .select('id, display_name, email, role, active, created_at')
        .single();

      if (profileError || !profile) {
        await adminClient.auth.admin.deleteUser(invitedUserId);
        throw new Error(`PROFILE_CREATE_FAILED:${profileError?.message || 'unknown'}`);
      }

      const { error: roleError } = await adminClient.from('user_roles').insert({
        user_id: invitedUserId,
        profile_id: profile.id,
        barbershop_user_id: ownerId,
        role,
      });
      if (roleError) {
        if (duplicate) {
          await adminClient.from('profiles').update({ auth_user_id: null }).eq('id', profile.id);
        } else {
          await adminClient.from('profiles').delete().eq('id', profile.id);
        }
        await adminClient.auth.admin.deleteUser(invitedUserId);
        throw new Error(`ROLE_CREATE_FAILED:${roleError.message}`);
      }

      return json({ profile, invite_sent: true }, 201);
    }

    if (!payload.profile_id) return json({ error: 'PROFILE_REQUIRED' }, 400);
    const { data: currentProfile } = await adminClient
      .from('profiles')
      .select('id, auth_user_id, display_name, email, role, active')
      .eq('id', payload.profile_id)
      .eq('user_id', ownerId)
      .maybeSingle();
    if (!currentProfile || !currentProfile.auth_user_id) return json({ error: 'TEAM_MEMBER_NOT_FOUND' }, 404);

    if (payload.action === 'update') {
      const name = payload.display_name?.trim() || currentProfile.display_name;
      const role = payload.role || currentProfile.role as TeamRole;
      if (!name || role !== 'barbeiro') return json({ error: 'INVALID_TEAM_MEMBER' }, 400);

      const { data: profile, error: updateError } = await adminClient
        .from('profiles')
        .update({ display_name: name, role })
        .eq('id', currentProfile.id)
        .eq('user_id', ownerId)
        .select('id, display_name, email, role, active, created_at')
        .single();
      if (updateError) throw updateError;

      if (currentProfile.active) {
        await adminClient.from('user_roles').delete().eq('profile_id', currentProfile.id);
        const { error: roleError } = await adminClient.from('user_roles').insert({
          user_id: currentProfile.auth_user_id,
          profile_id: currentProfile.id,
          barbershop_user_id: ownerId,
          role,
        });
        if (roleError) throw roleError;
      }
      return json({ profile });
    }

    const active = Boolean(payload.active);
    const { data: profile, error: activeError } = await adminClient
      .from('profiles')
      .update({ active })
      .eq('id', currentProfile.id)
      .eq('user_id', ownerId)
      .select('id, display_name, email, role, active, created_at')
      .single();
    if (activeError) throw activeError;

    await adminClient.from('user_roles').delete().eq('profile_id', currentProfile.id);
    if (active) {
      const { error: roleError } = await adminClient.from('user_roles').insert({
        user_id: currentProfile.auth_user_id,
        profile_id: currentProfile.id,
        barbershop_user_id: ownerId,
        role: currentProfile.role,
      });
      if (roleError) throw roleError;
    }

    return json({ profile });
  } catch (error) {
    console.error('[manage-team-access]', error instanceof Error ? error.message : String(error));
    return json({ error: 'TEAM_ACCESS_OPERATION_FAILED' }, 500);
  }
});
