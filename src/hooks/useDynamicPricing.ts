import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface PricingRule {
  id: string;
  user_id: string;
  name: string;
  rule_type: 'time_based' | 'day_based' | 'barber_based' | 'promo';
  service_id: string | null;
  barber_id: string | null;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  price_modifier_type: 'percentage' | 'fixed';
  price_modifier_value: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  priority: number;
  created_at: string;
  updated_at?: string;
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

export function useDynamicPricing(barbershopUserId?: string) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch pricing rules - if barbershopUserId provided, fetch for that barbershop (public)
  // Otherwise fetch for authenticated user (admin)
  const { data: pricingRules = [], isLoading } = useQuery({
    queryKey: ['pricing-rules', barbershopUserId || user?.id],
    queryFn: async () => {
      const targetUserId = barbershopUserId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('user_id', targetUserId)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as PricingRule[];
    },
    enabled: !!(barbershopUserId || user?.id),
  });

  // Create rule mutation
  const createRule = useMutation({
    mutationFn: async (input: CreatePricingRuleInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pricing_rules')
        .insert({
          user_id: user.id,
          name: input.name,
          rule_type: input.rule_type,
          service_id: input.service_id || null,
          barber_id: input.barber_id || null,
          day_of_week: input.day_of_week ?? null,
          start_time: input.start_time || null,
          end_time: input.end_time || null,
          price_modifier_type: input.price_modifier_type,
          price_modifier_value: input.price_modifier_value,
          valid_from: input.valid_from || null,
          valid_until: input.valid_until || null,
          priority: input.priority ?? 0,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast({
        title: 'Regra criada',
        description: 'A regra de preço foi criada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update rule mutation
  const updateRule = useMutation({
    mutationFn: async (data: Partial<PricingRule> & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('pricing_rules')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast({
        title: 'Regra atualizada',
        description: 'A regra de preço foi atualizada.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete rule mutation
  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast({
        title: 'Regra removida',
        description: 'A regra de preço foi removida.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle rule active status
  const toggleRule = useMutation({
    mutationFn: async (data: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ active: data.active })
        .eq('id', data.id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate price with applicable rules
  const calculatePrice = useCallback((
    basePrice: number,
    serviceId: string | null,
    barberId: string | null,
    date: Date,
    time: string
  ): { finalPrice: number; appliedRules: PricingRule[] } => {
    if (!pricingRules.length) {
      return { finalPrice: basePrice, appliedRules: [] };
    }

    const dayOfWeek = date.getDay();
    const now = new Date();

    // Filter applicable rules
    const applicableRules = pricingRules
      .filter(rule => rule.active)
      .filter(rule => !rule.service_id || rule.service_id === serviceId)
      .filter(rule => !rule.barber_id || rule.barber_id === barberId)
      .filter(rule => rule.day_of_week === null || rule.day_of_week === dayOfWeek)
      .filter(rule => {
        if (!rule.start_time || !rule.end_time) return true;
        return time >= rule.start_time && time <= rule.end_time;
      })
      .filter(rule => {
        if (!rule.valid_from && !rule.valid_until) return true;
        const ruleStart = rule.valid_from ? new Date(rule.valid_from) : null;
        const ruleEnd = rule.valid_until ? new Date(rule.valid_until) : null;
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        if (ruleStart) ruleStart.setHours(0, 0, 0, 0);
        if (ruleEnd) ruleEnd.setHours(23, 59, 59, 999);
        if (ruleStart && checkDate < ruleStart) return false;
        if (ruleEnd && checkDate > ruleEnd) return false;
        return true;
      })
      .sort((a, b) => b.priority - a.priority);

    // Calculate final price
    let finalPrice = basePrice;
    for (const rule of applicableRules) {
      if (rule.price_modifier_type === 'percentage') {
        finalPrice = finalPrice * (1 + rule.price_modifier_value / 100);
      } else {
        finalPrice = finalPrice + rule.price_modifier_value;
      }
    }

    return { 
      finalPrice: Math.max(0, Math.round(finalPrice * 100) / 100), 
      appliedRules: applicableRules 
    };
  }, [pricingRules]);

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
