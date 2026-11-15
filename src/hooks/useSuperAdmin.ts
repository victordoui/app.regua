import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type {
  PlatformSubscription,
  PlatformCoupon,
  AuditLog,
  SubscriptionStats,
  CouponFormData,
  SubscriberFilters,
  PlanType,
  SubscriptionStatus,
  AuditAction,
} from '@/types/superAdmin';
import type { Json } from '@/integrations/supabase/types';
import { getEffectiveSubscriptionStatus } from '@/lib/platformSubscriptionStatus';
import { calculatePlatformChurn } from '@/lib/platformSubscriptionChurn';
import { buildMonthlyPlatformRevenue } from '@/lib/platformRevenue';
import { calculatePlatformTrialConversion } from '@/lib/platformTrialConversion';

const readAllPages = async <T>(loadPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) => {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await loadPage(from, from + 999);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
};

// Hook for managing platform subscriptions
export const useSubscribers = (filters?: SubscriberFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const subscribersQuery = useQuery({
    queryKey: ['platform-subscriptions', filters],
    queryFn: async (): Promise<PlatformSubscription[]> => {
      let query = supabase
        .from('platform_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.plan) {
        query = query.eq('plan_type', filters.plan);
      }

      const { data, error } = await query;
      if (error) throw error;
      const subscriptions = (data || []).map((subscription) => ({
        ...subscription,
        status: getEffectiveSubscriptionStatus(subscription) as SubscriptionStatus,
      })) as PlatformSubscription[];
      return filters?.status
        ? subscriptions.filter((subscription) => subscription.status === filters.status)
        : subscriptions;
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async ({
      id,
      updates,
      action,
    }: {
      id: string;
      updates: Partial<PlatformSubscription>;
      action: AuditAction;
    }) => {
      const { data: subscription, error: fetchError } = await supabase
        .from('platform_subscriptions')
        .select('user_id')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!subscription) throw new Error('Assinatura não encontrada');

      const { error } = await supabase
        .from('platform_subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Log the action
      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action,
        target_user_id: subscription.user_id,
        details: updates as Json,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      toast({ title: 'Assinatura atualizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const suspendSubscription = (id: string) =>
    updateSubscription.mutate({
      id,
      updates: { status: 'suspended' },
      action: 'suspend_subscription',
    });

  const activateSubscription = (id: string) =>
    updateSubscription.mutate({
      id,
      updates: { status: 'active' },
      action: 'activate_subscription',
    });

  const cancelSubscription = (id: string) =>
    updateSubscription.mutate({
      id,
      updates: { status: 'cancelled' },
      action: 'cancel_subscription',
    });

  const renewSubscription = (id: string, endDate: string) =>
    updateSubscription.mutate({
      id,
      updates: { end_date: endDate, status: 'active' },
      action: 'renew_subscription',
    });

  const changePlan = (id: string, plan: PlanType) =>
    updateSubscription.mutate({
      id,
      updates: { plan_type: plan },
      action: 'change_plan',
    });

  return {
    subscribers: subscribersQuery.data || [],
    isLoading: subscribersQuery.isLoading,
    error: subscribersQuery.error,
    suspendSubscription,
    activateSubscription,
    cancelSubscription,
    renewSubscription,
    changePlan,
    isUpdating: updateSubscription.isPending,
  };
};

// Hook for platform statistics
export type PlatformStatsPeriod = 'today' | 'week' | 'month';

const periodBounds = (period: PlatformStatsPeriod, now: Date) => {
  const start = new Date(now);
  if (period === 'today') start.setHours(0, 0, 0, 0);
  if (period === 'week') {
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  }
  if (period === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  const previousStart = new Date(start);
  if (period === 'today') previousStart.setDate(previousStart.getDate() - 1);
  if (period === 'week') previousStart.setDate(previousStart.getDate() - 7);
  if (period === 'month') previousStart.setMonth(previousStart.getMonth() - 1);
  return { start, previousStart, end: now };
};

export const usePlatformStats = (period: PlatformStatsPeriod = 'month') => {
  return useQuery({
    queryKey: ['platform-stats', period],
    queryFn: async (): Promise<SubscriptionStats> => {
      const [subscriptionResult, planResult, paymentResult, eventResult] = await Promise.all([
        readAllPages((from, to) => supabase.from('platform_subscriptions').select('*').range(from, to)),
        supabase.from('platform_plan_config').select('plan_type,display_name,price_monthly'),
        readAllPages((from, to) => supabase.from('platform_payments').select('user_id,amount,status,created_at').range(from, to)),
        readAllPages((from, to) => supabase.from('platform_subscription_events').select('user_id,event_type,previous_plan_type,plan_type,previous_status,status,end_date,created_at').order('created_at', { ascending: true }).range(from, to)),
      ]);
      if (planResult.error) throw planResult.error;

      const subscriptions = subscriptionResult;
      const plans = planResult.data || [];
      const payments = paymentResult;
      const events = eventResult;
      const now = new Date();
      const { start: periodStart, previousStart } = periodBounds(period, now);
      const previousEnd = new Date(periodStart);
      const activeSubscriptions = subscriptions.filter((subscription) =>
        getEffectiveSubscriptionStatus(subscription) === 'active'
      );
      const isBetween = (date: string | null, from: Date, to: Date) => Boolean(date && Date.parse(date) >= from.getTime() && Date.parse(date) < to.getTime());
      const currentNew = subscriptions.filter((subscription) => isBetween(subscription.created_at, periodStart, now)).length;
      const previousNew = subscriptions.filter((subscription) => isBetween(subscription.created_at, previousStart, previousEnd)).length;
      const trialConversion = calculatePlatformTrialConversion(events, periodStart, now);
      const cancellationUsers = new Set(events.filter((event) => event.event_type === 'status_changed' && event.previous_status === 'active' && event.status === 'cancelled' && isBetween(event.created_at, periodStart, now)).map((event) => event.user_id));
      const churn = calculatePlatformChurn(subscriptions, events, periodStart, now);
      const planConfigs = new Map(plans.map((plan) => [plan.plan_type, plan]));
      const revenueByPlan = (['basic', 'pro', 'enterprise'] as const).map((planType) => {
        const plan = planConfigs.get(planType);
        const subscribers = activeSubscriptions.filter((subscription) => subscription.plan_type === planType).length;
        return { plan_type: planType, label: plan?.display_name || planType, subscribers, revenue: subscribers * Number(plan?.price_monthly || 0) };
      });
      const mrr = revenueByPlan.reduce((sum, plan) => sum + plan.revenue, 0);
      const paidPayments = payments.filter((payment) => payment.status === 'paid');
      const totalPaidRevenue = paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const ltvPayers = new Set(paidPayments.map((payment) => payment.user_id)).size;
      const growthByMonth = Array.from({ length: 6 }, (_, index) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
        const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
        return {
          month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(monthStart).replace('.', ''),
          assinantes: subscriptions.filter((subscription) => isBetween(subscription.created_at, monthStart, nextMonth)).length,
        };
      });
      const revenueByMonth = buildMonthlyPlatformRevenue(payments, now);

      const stats: SubscriptionStats = {
        total_subscribers: subscriptions.length,
        active_subscribers: activeSubscriptions.length,
        trial_subscribers: activeSubscriptions.filter(s => s.plan_type === 'trial').length,
        suspended_subscribers: subscriptions.filter(s => s.status === 'suspended').length,
        cancelled_subscribers: subscriptions.filter(s => s.status === 'cancelled').length,
        expired_subscribers: subscriptions.filter(s => getEffectiveSubscriptionStatus(s) === 'expired').length,
        monthly_revenue: mrr,
        new_this_month: currentNew,
        previous_period_new: previousNew,
        new_change_percent: previousNew ? ((currentNew - previousNew) / previousNew) * 100 : currentNew ? 100 : 0,
        cancellations_in_period: cancellationUsers.size,
        trial_conversion_count: trialConversion.converted,
        trial_conversion_percent: trialConversion.percent,
        ltv: ltvPayers ? totalPaidRevenue / ltvPayers : 0,
        period_label: period === 'today' ? 'hoje' : period === 'week' ? 'nesta semana' : 'neste mês',
        growth_by_month: growthByMonth,
        revenue_by_month: revenueByMonth,
        revenue_by_plan: revenueByPlan,
        churn_rate: churn.rate,
        by_plan: {
          trial: activeSubscriptions.filter(s => s.plan_type === 'trial').length,
          basic: activeSubscriptions.filter(s => s.plan_type === 'basic').length,
          pro: activeSubscriptions.filter(s => s.plan_type === 'pro').length,
          enterprise: activeSubscriptions.filter(s => s.plan_type === 'enterprise').length,
        },
      };

      return stats;
    },
  });
};

// Hook for platform coupons
export const usePlatformCoupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const couponsQuery = useQuery({
    queryKey: ['platform-coupons'],
    queryFn: async (): Promise<PlatformCoupon[]> => {
      const { data, error } = await supabase
        .from('platform_coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PlatformCoupon[];
    },
  });

  const createCoupon = useMutation({
    mutationFn: async (couponData: CouponFormData) => {
      const { error } = await supabase.from('platform_coupons').insert({
        ...couponData,
        created_by: user?.id,
      });

      if (error) throw error;

      // Log action
      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'create_coupon',
        details: { ...couponData } as Json,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-coupons'] });
      toast({ title: 'Cupom criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar cupom',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCoupon = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CouponFormData> }) => {
      const { error } = await supabase
        .from('platform_coupons')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'update_coupon',
        details: { coupon_id: id, ...data },
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-coupons'] });
      toast({ title: 'Cupom atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar cupom',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'delete_coupon',
        details: { coupon_id: id },
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-coupons'] });
      toast({ title: 'Cupom excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir cupom',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    coupons: couponsQuery.data || [],
    isLoading: couponsQuery.isLoading,
    error: couponsQuery.error,
    createCoupon: createCoupon.mutate,
    updateCoupon: updateCoupon.mutate,
    deleteCoupon: deleteCoupon.mutate,
    isCreating: createCoupon.isPending,
    isUpdating: updateCoupon.isPending,
    isDeleting: deleteCoupon.isPending,
  };
};

// Hook for audit logs
export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['platform-audit-logs'],
    queryFn: async (): Promise<AuditLog[]> => {
      const { data, error } = await supabase
        .from('platform_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as AuditLog[];
    },
  });
};
