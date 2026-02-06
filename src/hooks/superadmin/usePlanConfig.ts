import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { PlanConfig, PlanConfigFormData, PlanType } from '@/types/superAdmin';

export const usePlanConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const plansQuery = useQuery({
    queryKey: ['platform-plan-config'],
    queryFn: async (): Promise<PlanConfig[]> => {
      const { data, error } = await supabase
        .from('platform_plan_config')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as PlanConfig[];
    },
  });

  const updatePlanConfig = useMutation({
    mutationFn: async ({ planType, data }: { planType: PlanType; data: PlanConfigFormData }) => {
      const { error } = await supabase
        .from('platform_plan_config')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('plan_type', planType);

      if (error) throw error;

      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'update_plan_config',
        details: { plan_type: planType, ...data } as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-plan-config'] });
      toast({ title: 'Configuração de plano atualizada!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar configuração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const togglePlanActive = useMutation({
    mutationFn: async ({ planType, isActive }: { planType: PlanType; isActive: boolean }) => {
      const { error } = await supabase
        .from('platform_plan_config')
        .update({ is_active: isActive })
        .eq('plan_type', planType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-plan-config'] });
      toast({ title: 'Status do plano atualizado!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar plano',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    plans: plansQuery.data || [],
    isLoading: plansQuery.isLoading,
    error: plansQuery.error,
    updatePlanConfig: updatePlanConfig.mutate,
    togglePlanActive: togglePlanActive.mutate,
    isUpdating: updatePlanConfig.isPending,
  };
};
