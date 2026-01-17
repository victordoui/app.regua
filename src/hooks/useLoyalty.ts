import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  client_id: string;
  points: number;
  total_earned: number;
  total_redeemed: number;
  created_at: string;
  updated_at: string;
  client?: { name: string; phone: string } | null;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  loyalty_points_id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string | null;
  appointment_id: string | null;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  user_id: string;
  name: string;
  points_required: number;
  reward_type: 'discount' | 'service' | 'product';
  reward_value: number | null;
  active: boolean;
  created_at: string;
}

export interface RewardFormData {
  name: string;
  points_required: number;
  reward_type: 'discount' | 'service' | 'product';
  reward_value?: number;
  active?: boolean;
}

export const useLoyalty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch loyalty points
  const fetchLoyaltyPoints = useCallback(async (): Promise<LoyaltyPoints[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .order('points', { ascending: false });

    if (error) throw error;

    // Enrich with client data
    const clientIds = data?.map(lp => lp.client_id).filter(Boolean) || [];
    if (clientIds.length === 0) return data || [];

    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, phone')
      .in('id', clientIds);

    const clientsMap = new Map(clients?.map(c => [c.id, c]) || []);

    return (data || []).map(lp => ({
      ...lp,
      client: clientsMap.get(lp.client_id) || null
    }));
  }, [user]);

  // Fetch rewards
  const fetchRewards = useCallback(async (): Promise<LoyaltyReward[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('points_required', { ascending: true });

    if (error) throw error;
    return (data || []) as LoyaltyReward[];
  }, [user]);

  const { data: loyaltyPoints = [], isLoading: isLoadingPoints } = useQuery({
    queryKey: ['loyaltyPoints', user?.id],
    queryFn: fetchLoyaltyPoints,
    enabled: !!user
  });

  const { data: rewards = [], isLoading: isLoadingRewards } = useQuery({
    queryKey: ['loyaltyRewards', user?.id],
    queryFn: fetchRewards,
    enabled: !!user
  });

  // Add points to client
  const addPointsMutation = useMutation({
    mutationFn: async ({ clientId, points, description, appointmentId }: { 
      clientId: string; 
      points: number; 
      description?: string;
      appointmentId?: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Get or create loyalty_points record
      let { data: existing } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .single();

      if (!existing) {
        const { data: newRecord, error: createError } = await supabase
          .from('loyalty_points')
          .insert({ user_id: user.id, client_id: clientId, points: 0, total_earned: 0, total_redeemed: 0 })
          .select()
          .single();
        if (createError) throw createError;
        existing = newRecord;
      }

      // Update points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({ 
          points: existing.points + points,
          total_earned: existing.total_earned + points
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      // Create transaction
      const { error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          loyalty_points_id: existing.id,
          type: 'earn',
          points,
          description: description || 'Pontos acumulados',
          appointment_id: appointmentId || null
        });

      if (txError) throw txError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyPoints'] });
      toast({ title: 'Pontos adicionados com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar pontos', description: error.message, variant: 'destructive' });
    }
  });

  // Redeem points
  const redeemPointsMutation = useMutation({
    mutationFn: async ({ clientId, points, rewardName }: { 
      clientId: string; 
      points: number;
      rewardName: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: existing } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .single();

      if (!existing || existing.points < points) {
        throw new Error('Pontos insuficientes');
      }

      // Update points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({ 
          points: existing.points - points,
          total_redeemed: existing.total_redeemed + points
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      // Create transaction
      const { error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          loyalty_points_id: existing.id,
          type: 'redeem',
          points,
          description: `Resgatou: ${rewardName}`
        });

      if (txError) throw txError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyPoints'] });
      toast({ title: 'Recompensa resgatada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao resgatar recompensa', description: error.message, variant: 'destructive' });
    }
  });

  // Create reward
  const createRewardMutation = useMutation({
    mutationFn: async (formData: RewardFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('loyalty_rewards')
        .insert({
          user_id: user.id,
          name: formData.name,
          points_required: formData.points_required,
          reward_type: formData.reward_type,
          reward_value: formData.reward_value || null,
          active: formData.active ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyRewards'] });
      toast({ title: 'Recompensa criada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar recompensa', description: error.message, variant: 'destructive' });
    }
  });

  // Delete reward
  const deleteRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('loyalty_rewards')
        .delete()
        .eq('id', rewardId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyRewards'] });
      toast({ title: 'Recompensa removida!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover recompensa', description: error.message, variant: 'destructive' });
    }
  });

  // Stats
  const stats = {
    totalClients: loyaltyPoints.length,
    totalPointsDistributed: loyaltyPoints.reduce((sum, lp) => sum + lp.total_earned, 0),
    totalPointsRedeemed: loyaltyPoints.reduce((sum, lp) => sum + lp.total_redeemed, 0),
    activeRewards: rewards.filter(r => r.active).length
  };

  return {
    loyaltyPoints,
    rewards,
    stats,
    isLoading: isLoadingPoints || isLoadingRewards,
    addPoints: addPointsMutation.mutateAsync,
    redeemPoints: redeemPointsMutation.mutateAsync,
    createReward: createRewardMutation.mutateAsync,
    deleteReward: deleteRewardMutation.mutateAsync,
    isAddingPoints: addPointsMutation.isPending,
    isRedeeming: redeemPointsMutation.isPending,
    isCreatingReward: createRewardMutation.isPending
  };
};
