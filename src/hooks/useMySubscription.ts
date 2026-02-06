import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays, startOfMonth, endOfMonth } from 'date-fns';

export interface SubscriptionData {
  subscription: any | null;
  planConfig: any | null;
  usage: {
    barbersCount: number;
    appointmentsThisMonth: number;
  };
  daysRemaining: number | null;
  progressPercent: number;
  isLoading: boolean;
}

export function useMySubscription(targetUserId?: string) {
  const { user } = useAuth();
  const userId = targetUserId || user?.id;

  const subscriptionQuery = useQuery({
    queryKey: ['my-subscription', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: sub, error } = await supabase
        .from('platform_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return sub;
    },
    enabled: !!userId,
  });

  const planConfigQuery = useQuery({
    queryKey: ['plan-config', subscriptionQuery.data?.plan_type],
    queryFn: async () => {
      const planType = subscriptionQuery.data?.plan_type;
      if (!planType) return null;

      const { data, error } = await supabase
        .from('platform_plan_config')
        .select('*')
        .eq('plan_type', planType)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionQuery.data?.plan_type,
  });

  const usageQuery = useQuery({
    queryKey: ['subscription-usage', userId],
    queryFn: async () => {
      if (!userId) return { barbersCount: 0, appointmentsThisMonth: 0 };

      const now = new Date();
      const monthStart = startOfMonth(now).toISOString().split('T')[0];
      const monthEnd = endOfMonth(now).toISOString().split('T')[0];

      const [barbersRes, appointmentsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'barber' as any),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('appointment_date', monthStart)
          .lte('appointment_date', monthEnd),
      ]);

      return {
        barbersCount: barbersRes.count || 0,
        appointmentsThisMonth: appointmentsRes.count || 0,
      };
    },
    enabled: !!userId,
  });

  const sub = subscriptionQuery.data;
  let daysRemaining: number | null = null;
  let progressPercent = 0;

  if (sub?.start_date && sub?.end_date) {
    const start = new Date(sub.start_date);
    const end = new Date(sub.end_date);
    const now = new Date();
    const totalDays = differenceInDays(end, start);
    const elapsed = differenceInDays(now, start);
    daysRemaining = Math.max(0, differenceInDays(end, now));
    progressPercent = totalDays > 0 ? Math.min(100, Math.round((elapsed / totalDays) * 100)) : 0;
  }

  return {
    subscription: sub || null,
    planConfig: planConfigQuery.data || null,
    usage: usageQuery.data || { barbersCount: 0, appointmentsThisMonth: 0 },
    daysRemaining,
    progressPercent,
    isLoading: subscriptionQuery.isLoading || planConfigQuery.isLoading || usageQuery.isLoading,
  } as SubscriptionData;
}
