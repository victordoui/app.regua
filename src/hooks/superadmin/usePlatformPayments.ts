import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformPayment, PaymentStats, PaymentFilters } from '@/types/superAdmin';

export const usePlatformPayments = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: ['platform-payments', filters],
    queryFn: async (): Promise<PlatformPayment[]> => {
      let query = supabase
        .from('platform_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.payment_method) {
        query = query.eq('payment_method', filters.payment_method);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PlatformPayment[];
    },
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: ['platform-payment-stats'],
    queryFn: async (): Promise<PaymentStats> => {
      // Get all payments
      const { data: payments, error: paymentsError } = await supabase
        .from('platform_payments')
        .select('*');

      if (paymentsError) throw paymentsError;

      // Get plan configs for pricing
      const { data: planConfigs, error: plansError } = await supabase
        .from('platform_plan_config')
        .select('*');

      if (plansError) throw plansError;

      // Get active subscriptions for MRR calculation
      const { data: subscriptions, error: subsError } = await supabase
        .from('platform_subscriptions')
        .select('*')
        .eq('status', 'active');

      if (subsError) throw subsError;

      const planPrices: Record<string, number> = {};
      (planConfigs || []).forEach((p: any) => {
        planPrices[p.plan_type] = p.price_monthly || 0;
      });

      // Calculate MRR from active subscriptions
      const mrr = (subscriptions || []).reduce((acc: number, sub: any) => {
        return acc + (planPrices[sub.plan_type] || 0);
      }, 0);

      const allPayments = payments || [];
      const paidPayments = allPayments.filter((p: any) => p.status === 'paid');
      const pendingPayments = allPayments.filter((p: any) => p.status === 'pending');
      const failedPayments = allPayments.filter((p: any) => p.status === 'failed');

      const totalRevenue = paidPayments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
      const averageTicket = paidPayments.length > 0 ? totalRevenue / paidPayments.length : 0;

      // Simple LTV calculation (average revenue per customer)
      const uniqueUsers = new Set(paidPayments.map((p: any) => p.user_id)).size;
      const ltv = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0;

      return {
        mrr,
        mrr_growth: 0, // Would need historical data
        total_revenue: totalRevenue,
        pending_payments: pendingPayments.length,
        failed_payments: failedPayments.length,
        average_ticket: averageTicket,
        ltv,
      };
    },
  });
};
