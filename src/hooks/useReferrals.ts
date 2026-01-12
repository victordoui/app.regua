import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Referral {
  id: string;
  user_id: string;
  referrer_client_id: string;
  referred_client_id: string;
  referral_code: string;
  reward_given: boolean;
  reward_amount: number | null;
  created_at: string;
  referrer?: { name: string } | null;
  referred?: { name: string } | null;
}

export interface ReferralFormData {
  referrer_client_id: string;
  referred_client_id: string;
  referral_code: string;
  reward_amount?: number;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchReferrals = useCallback(async (): Promise<Referral[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with client names
    const clientIds = [...new Set([
      ...data.map(r => r.referrer_client_id),
      ...data.map(r => r.referred_client_id)
    ])];

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', clientIds);

      const clientsMap = new Map<string, { id: string; name: string }>();
      clients?.forEach(c => clientsMap.set(c.id, c));

      return data.map(r => ({
        ...r,
        referrer: clientsMap.get(r.referrer_client_id) || null,
        referred: clientsMap.get(r.referred_client_id) || null
      }));
    }

    return data || [];
  }, [user]);

  const { data: referrals = [], isLoading, error } = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: fetchReferrals,
    enabled: !!user
  });

  const addReferralMutation = useMutation({
    mutationFn: async (formData: ReferralFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          user_id: user.id,
          referrer_client_id: formData.referrer_client_id,
          referred_client_id: formData.referred_client_id,
          referral_code: formData.referral_code,
          reward_amount: formData.reward_amount || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast({ title: 'Indicação registrada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar indicação', description: error.message, variant: 'destructive' });
    }
  });

  const markRewardGivenMutation = useMutation({
    mutationFn: async (referralId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('referrals')
        .update({ reward_given: true })
        .eq('id', referralId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast({ title: 'Recompensa marcada como entregue!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao marcar recompensa', description: error.message, variant: 'destructive' });
    }
  });

  const generateReferralCode = (clientName: string): string => {
    const cleanName = clientName.replace(/\s/g, '').toUpperCase().substring(0, 4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName}${random}`;
  };

  const getReferralsByReferrer = (clientId: string) => {
    return referrals.filter(r => r.referrer_client_id === clientId);
  };

  const getTotalReferrals = (clientId: string) => {
    return getReferralsByReferrer(clientId).length;
  };

  return {
    referrals,
    isLoading,
    error,
    addReferral: addReferralMutation.mutateAsync,
    markRewardGiven: markRewardGivenMutation.mutateAsync,
    generateReferralCode,
    getReferralsByReferrer,
    getTotalReferrals,
    isAdding: addReferralMutation.isPending,
    isMarking: markRewardGivenMutation.isPending
  };
};
