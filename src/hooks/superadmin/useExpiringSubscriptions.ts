import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformSubscription } from '@/types/superAdmin';
import { addBusinessCalendarDays, businessDateKey, formatBusinessDateInput } from '@/lib/formatters';

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

      const today = formatBusinessDateInput();
      const futureDate = addBusinessCalendarDays(today, daysAhead);

      // Filter subscriptions expiring within the specified days
      return (data || []).filter((sub) => {
        if (!sub.end_date) return false;
        const endDate = new Date(sub.end_date);
        const endDateKey = businessDateKey(sub.end_date);
        return endDate.getTime() > Date.now() && endDateKey <= futureDate;
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

      const today = formatBusinessDateInput();
      const in7Days = addBusinessCalendarDays(today, 7);
      const in15Days = addBusinessCalendarDays(today, 15);
      const in30Days = addBusinessCalendarDays(today, 30);

      const subscriptions = data || [];

      return {
        expiring7Days: subscriptions.filter((s) => {
          const end = new Date(s.end_date);
          return end.getTime() > Date.now() && businessDateKey(s.end_date) <= in7Days;
        }).length,
        expiring15Days: subscriptions.filter((s) => {
          const end = new Date(s.end_date);
          return end.getTime() > Date.now() && businessDateKey(s.end_date) <= in15Days;
        }).length,
        expiring30Days: subscriptions.filter((s) => {
          const end = new Date(s.end_date);
          return end.getTime() > Date.now() && businessDateKey(s.end_date) <= in30Days;
        }).length,
      };
    },
  });
};
