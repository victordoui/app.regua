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

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.plan) {
        query = query.eq('plan_type', filters.plan);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PlatformSubscription[];
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
        .single();

      if (fetchError) throw fetchError;

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
        details: updates as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      toast({ title: 'Assinatura atualizada com sucesso!' });
    },
    onError: (error: any) => {
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
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async (): Promise<SubscriptionStats> => {
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('*');

      if (error) throw error;

      const subscriptions = data || [];
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: SubscriptionStats = {
        total_subscribers: subscriptions.length,
        active_subscribers: subscriptions.filter(s => s.status === 'active').length,
        trial_subscribers: subscriptions.filter(s => s.plan_type === 'trial').length,
        suspended_subscribers: subscriptions.filter(s => s.status === 'suspended').length,
        cancelled_subscribers: subscriptions.filter(s => s.status === 'cancelled').length,
        monthly_revenue: 0, // Would need pricing table to calculate
        new_this_month: subscriptions.filter(
          s => new Date(s.created_at) >= monthStart
        ).length,
        churn_rate: subscriptions.length > 0
          ? (subscriptions.filter(s => s.status === 'cancelled').length / subscriptions.length) * 100
          : 0,
        by_plan: {
          trial: subscriptions.filter(s => s.plan_type === 'trial').length,
          basic: subscriptions.filter(s => s.plan_type === 'basic').length,
          pro: subscriptions.filter(s => s.plan_type === 'pro').length,
          enterprise: subscriptions.filter(s => s.plan_type === 'enterprise').length,
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
        details: couponData as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-coupons'] });
      toast({ title: 'Cupom criado com sucesso!' });
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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
