import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformSubscription } from '@/types/superAdmin';
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';

export const useExpiringSubscriptions = (daysAhead: number = 7) => {
  return useQuery({
    queryKey: ['expiring-subscriptions', daysAhead],
    queryFn: async (): Promise<PlatformSubscription[]> => {
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('*')
        .eq('status', 'active')
        .not('end_date', 'is', null)
        .order('end_date', { ascending: true });

      if (error) throw error;

      const today = startOfDay(new Date());
      const futureDate = addDays(today, daysAhead);

      // Filter subscriptions expiring within the specified days
      return (data || []).filter((sub: any) => {
        if (!sub.end_date) return false;
        const endDate = new Date(sub.end_date);
        return isAfter(endDate, today) && isBefore(endDate, futureDate);
      }) as PlatformSubscription[];
    },
  });
};

export const useExpiringStats = () => {
  return useQuery({
    queryKey: ['expiring-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('end_date')
        .eq('status', 'active')
        .not('end_date', 'is', null);

      if (error) throw error;

      const today = startOfDay(new Date());
      const in7Days = addDays(today, 7);
      const in15Days = addDays(today, 15);
      const in30Days = addDays(today, 30);

      const subscriptions = data || [];

      return {
        expiring7Days: subscriptions.filter((s: any) => {
          const end = new Date(s.end_date);
          return isAfter(end, today) && isBefore(end, in7Days);
        }).length,
        expiring15Days: subscriptions.filter((s: any) => {
          const end = new Date(s.end_date);
          return isAfter(end, today) && isBefore(end, in15Days);
        }).length,
        expiring30Days: subscriptions.filter((s: any) => {
          const end = new Date(s.end_date);
          return isAfter(end, today) && isBefore(end, in30Days);
        }).length,
      };
    },
  });
};
