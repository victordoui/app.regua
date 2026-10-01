import { useCallback } from 'react';
import { resolveCommissionRate, commissionAmount } from '@/lib/commissionCalculation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CommissionRule {
  id: string;
  user_id: string;
  barber_id: string | null;
  service_id: string | null;
  commission_type: string;
  commission_value: number;
  created_at: string;
}

export interface CommissionRuleFormData {
  barber_id?: string | null;
  service_id?: string | null;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
}

export const useCommissionRules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchRules = useCallback(async (): Promise<CommissionRule[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CommissionRule[];
  }, [user]);

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['commissionRules', user?.id],
    queryFn: fetchRules,
    enabled: !!user
  });

  const getCommissionRate = useCallback((barberId: string | null, serviceId: string | null) => resolveCommissionRate(rules, barberId, serviceId), [rules]);
  const calculateCommission = useCallback((barberId: string | null, serviceId: string | null, servicePrice: number) => commissionAmount(getCommissionRate(barberId, serviceId), servicePrice), [getCommissionRate]);

  const addRuleMutation = useMutation({
    mutationFn: async (formData: CommissionRuleFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('commission_rules')
        .insert({
          user_id: user.id,
          barber_id: formData.barber_id || null,
          service_id: formData.service_id || null,
          commission_type: formData.commission_type,
          commission_value: formData.commission_value
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissionRules'] });
      toast({ title: 'Regra de comissão criada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar regra', description: error.message, variant: 'destructive' });
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<CommissionRuleFormData> }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('commission_rules')
        .update({
          barber_id: formData.barber_id,
          service_id: formData.service_id,
          commission_type: formData.commission_type,
          commission_value: formData.commission_value
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissionRules'] });
      toast({ title: 'Regra atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar regra', description: error.message, variant: 'destructive' });
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('commission_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissionRules'] });
      toast({ title: 'Regra excluída!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir regra', description: error.message, variant: 'destructive' });
    }
  });

  return {
    rules,
    isLoading,
    error,
    getCommissionRate,
    calculateCommission,
    addRule: addRuleMutation.mutateAsync,
    updateRule: updateRuleMutation.mutateAsync,
    deleteRule: deleteRuleMutation.mutateAsync,
    isAdding: addRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending
  };
};
