import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PricingRule {
  id: string;
  user_id: string;
  name: string;
  rule_type: 'time_based' | 'day_based' | 'barber_based' | 'promo';
  service_id: string | null;
  barber_id: string | null;
  day_of_week: number | null; // 0-6
  start_time: string | null;
  end_time: string | null;
  price_modifier_type: 'percentage' | 'fixed';
  price_modifier_value: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  priority: number;
  created_at: string;
}

export interface CreatePricingRuleInput {
  name: string;
  rule_type: PricingRule['rule_type'];
  service_id?: string;
  barber_id?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  price_modifier_type: 'percentage' | 'fixed';
  price_modifier_value: number;
  valid_from?: string;
  valid_until?: string;
  priority?: number;
}

export function useDynamicPricing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pricingRules = [], isLoading } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as PricingRule[];
    }
  });

  const createRule = useMutation({
    mutationFn: async (input: CreatePricingRuleInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pricing_rules')
        .insert({
          user_id: user.id,
          ...input,
          active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast({
        title: 'Regra Criada',
        description: 'Regra de preço criada com sucesso!',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a regra.',
        variant: 'destructive',
      });
    }
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...input }: Partial<PricingRule> & { id: string }) => {
      const { error } = await supabase
        .from('pricing_rules')
        .update(input)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast({
        title: 'Regra Atualizada',
        description: 'Regra de preço atualizada com sucesso!',
      });
    }
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast({
        title: 'Regra Removida',
        description: 'Regra de preço removida com sucesso!',
      });
    }
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  // Calculate price with applicable rules
  const calculatePrice = (
    basePrice: number,
    serviceId: string | null,
    barberId: string | null,
    date: Date,
    time: string
  ): { finalPrice: number; appliedRules: PricingRule[] } => {
    const dayOfWeek = date.getDay();
    const now = new Date();
    const appliedRules: PricingRule[] = [];

    // Filter applicable rules
    const applicableRules = pricingRules
      .filter(rule => {
        if (!rule.active) return false;
        
        // Check validity dates
        if (rule.valid_from && new Date(rule.valid_from) > now) return false;
        if (rule.valid_until && new Date(rule.valid_until) < now) return false;

        // Check service match
        if (rule.service_id && rule.service_id !== serviceId) return false;

        // Check barber match
        if (rule.barber_id && rule.barber_id !== barberId) return false;

        // Check day of week
        if (rule.day_of_week !== null && rule.day_of_week !== dayOfWeek) return false;

        // Check time range
        if (rule.start_time && rule.end_time) {
          if (time < rule.start_time || time > rule.end_time) return false;
        }

        return true;
      })
      .sort((a, b) => b.priority - a.priority);

    let finalPrice = basePrice;

    for (const rule of applicableRules) {
      if (rule.price_modifier_type === 'percentage') {
        finalPrice = finalPrice * (1 + rule.price_modifier_value / 100);
      } else {
        finalPrice = finalPrice + rule.price_modifier_value;
      }
      appliedRules.push(rule);
    }

    return { finalPrice: Math.max(0, finalPrice), appliedRules };
  };

  return {
    pricingRules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    calculatePrice
  };
}
