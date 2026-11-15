import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEffectiveSubscriptionStatus } from '@/lib/platformSubscriptionStatus';
import { businessDateTimeToISOString, getBusinessMonthDateRange } from '@/lib/formatters';

export interface PlatformUser {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string | null;
  active: boolean | null;
  company_name: string | null;
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
  expiredSubscriptions: number;
  paidSubscriptions: number;
  pendingPayment: number;
  orphanUsers: number;
  newThisMonth: number;
}

export const usePlatformUsers = (enabled = true) => {
  return useQuery({
    queryKey: ['platform-users'],
    queryFn: async (): Promise<{ users: PlatformUser[]; stats: PlatformUserStats }> => {
      const { data, error } = await supabase.functions.invoke('list-platform-users');
      if (error) throw error;

      const users = (data?.users || []) as PlatformUser[];
      const subscriptions = users.flatMap((user) => user.subscription ? [{
        ...user.subscription,
        user_id: user.user_id,
      }] : []);

      // Compute stats
      const byRole: Record<string, number> = {};
      for (const user of users) {
        for (const role of user.roles) byRole[role] = (byRole[role] || 0) + 1;
      }

      const now = new Date();
      const startOfMonth = businessDateTimeToISOString(getBusinessMonthDateRange(now).start);

      const stats: PlatformUserStats = {
        totalUsers: users.length,
        byRole,
        activeSubscriptions: subscriptions.filter((s) => getEffectiveSubscriptionStatus(s) === 'active').length,
        trialSubscriptions: subscriptions.filter((s) => s.plan_type === 'trial' && getEffectiveSubscriptionStatus(s) === 'active').length,
        expiredSubscriptions: subscriptions.filter((s) => getEffectiveSubscriptionStatus(s) === 'expired').length,
        paidSubscriptions: subscriptions.filter((s) => s.payment_status === 'paid').length,
        pendingPayment: subscriptions.filter((s) => s.payment_status === 'pending').length,
        orphanUsers: users.filter((user) => user.roles.length === 0).length,
        newThisMonth: users.filter((user) => user.created_at && user.created_at >= startOfMonth).length,
      };

      return { users, stats };
    },
    enabled,
  });
};
