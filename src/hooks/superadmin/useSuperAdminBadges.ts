import { useQuery } from '@tanstack/react-query';
import { addDays, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

/**
 * Contadores usados nos badges da sidebar do Super Admin.
 * Só executa quando o contexto Super Admin está ativo (enabled),
 * evitando requisições desnecessárias em contas Admin/Profissional.
 */
export const useSuperAdminBadges = (enabled: boolean) => {
  const openTickets = useQuery({
    queryKey: ['sidebar-open-tickets'],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_support_tickets')
        .select('status');
      if (error) throw error;
      return (data || []).filter((t) => t.status === 'open').length;
    },
  });

  const expiring7Days = useQuery({
    queryKey: ['sidebar-expiring-7d'],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('end_date')
        .eq('status', 'active')
        .not('end_date', 'is', null);
      if (error) throw error;

      const today = startOfDay(new Date());
      const in7Days = addDays(today, 7);
      return (data || []).filter((s) => {
        const end = new Date(s.end_date);
        return end >= today && end <= in7Days;
      }).length;
    },
  });

  return {
    openTickets: openTickets.data ?? 0,
    expiring7Days: expiring7Days.data ?? 0,
  };
};
