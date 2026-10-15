import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSubscriptionAccess(businessId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['subscription-access', businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('id, user_id, plan_type, status, payment_status, start_date, end_date')
        .eq('user_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: enabled && Boolean(businessId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
