import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformUser {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string | null;
  roles: string[];
  subscription?: {
    plan_type: string;
    status: string;
    payment_status: string | null;
    start_date: string | null;
    end_date: string | null;
  } | null;
}

export interface PlatformUserStats {
  totalUsers: number;
  byRole: Record<string, number>;
  activeSubscriptions: number;
  trialSubscriptions: number;
  paidSubscriptions: number;
  pendingPayment: number;
  orphanUsers: number;
  newThisMonth: number;
}

export const usePlatformUsers = () => {
  return useQuery({
    queryKey: ['platform-users'],
    queryFn: async (): Promise<{ users: PlatformUser[]; stats: PlatformUserStats }> => {
      // Fetch profiles, roles, and subscriptions in parallel
      const [profilesRes, rolesRes, subscriptionsRes] = await Promise.all([
        supabase.from('profiles').select('id, user_id, display_name, email, avatar_url, created_at'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('platform_subscriptions').select('user_id, plan_type, status, payment_status, start_date, end_date'),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const profiles = profilesRes.data || [];
      const roles = rolesRes.data || [];
      const subscriptions = subscriptionsRes.data || [];

      // Build role map
      const roleMap = new Map<string, string[]>();
      for (const r of roles) {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      }

      // Build subscription map (latest per user)
      const subMap = new Map<string, typeof subscriptions[0]>();
      for (const s of subscriptions) {
        subMap.set(s.user_id, s);
      }

      // Build users list
      const users: PlatformUser[] = profiles.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name,
        email: p.email,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        roles: roleMap.get(p.user_id) || [],
        subscription: subMap.get(p.user_id) ? {
          plan_type: subMap.get(p.user_id)!.plan_type,
          status: subMap.get(p.user_id)!.status,
          payment_status: subMap.get(p.user_id)!.payment_status,
          start_date: subMap.get(p.user_id)!.start_date,
          end_date: subMap.get(p.user_id)!.end_date,
        } : null,
      }));

      // Compute stats
      const byRole: Record<string, number> = {};
      for (const r of roles) {
        byRole[r.role] = (byRole[r.role] || 0) + 1;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const stats: PlatformUserStats = {
        totalUsers: profiles.length,
        byRole,
        activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
        trialSubscriptions: subscriptions.filter((s) => s.plan_type === 'trial').length,
        paidSubscriptions: subscriptions.filter((s) => s.payment_status === 'paid').length,
        pendingPayment: subscriptions.filter((s) => s.payment_status === 'pending').length,
        orphanUsers: profiles.filter((p) => !roleMap.has(p.user_id)).length,
        newThisMonth: profiles.filter((p) => p.created_at && p.created_at >= startOfMonth).length,
      };

      return { users, stats };
    },
  });
};
