import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CommissionRule {
  id: string;
  user_id: string;
  barber_id: string | null;
  service_id: string | null;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommissionRuleFormData {
  barber_id?: string | null;
  service_id?: string | null;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  is_default?: boolean;
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
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CommissionRule[];
  }, [user]);

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['commissionRules', user?.id],
    queryFn: fetchRules,
    enabled: !!user
  });

  // Get applicable commission rate for a specific barber and service
  const getCommissionRate = useCallback((barberId: string | null, serviceId: string | null): { type: 'percentage' | 'fixed'; value: number } => {
    // Priority: specific rule (barber+service) > barber rule > service rule > default
    
    // 1. Try to find specific rule for barber AND service
    if (barberId && serviceId) {
      const specificRule = rules.find(r => 
        r.barber_id === barberId && r.service_id === serviceId
      );
      if (specificRule) {
        return { type: specificRule.commission_type, value: specificRule.commission_value };
      }
    }

    // 2. Try to find rule for barber only
    if (barberId) {
      const barberRule = rules.find(r => 
        r.barber_id === barberId && !r.service_id
      );
      if (barberRule) {
        return { type: barberRule.commission_type, value: barberRule.commission_value };
      }
    }

    // 3. Try to find rule for service only
    if (serviceId) {
      const serviceRule = rules.find(r => 
        !r.barber_id && r.service_id === serviceId
      );
      if (serviceRule) {
        return { type: serviceRule.commission_type, value: serviceRule.commission_value };
      }
    }

    // 4. Use default rule
    const defaultRule = rules.find(r => r.is_default);
    if (defaultRule) {
      return { type: defaultRule.commission_type, value: defaultRule.commission_value };
    }

    // 5. Fallback to 40% if no rules exist
    return { type: 'percentage', value: 40 };
  }, [rules]);

  // Calculate commission amount
  const calculateCommission = useCallback((
    barberId: string | null, 
    serviceId: string | null, 
    servicePrice: number
  ): number => {
    const rate = getCommissionRate(barberId, serviceId);
    
    if (rate.type === 'percentage') {
      return (servicePrice * rate.value) / 100;
    }
    return rate.value;
  }, [getCommissionRate]);

  const addRuleMutation = useMutation({
    mutationFn: async (formData: CommissionRuleFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from('commission_rules')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('commission_rules')
        .insert({
          user_id: user.id,
          barber_id: formData.barber_id || null,
          service_id: formData.service_id || null,
          commission_type: formData.commission_type,
          commission_value: formData.commission_value,
          is_default: formData.is_default || false
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

      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from('commission_rules')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('commission_rules')
        .update({
          barber_id: formData.barber_id,
          service_id: formData.service_id,
          commission_type: formData.commission_type,
          commission_value: formData.commission_value,
          is_default: formData.is_default
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
