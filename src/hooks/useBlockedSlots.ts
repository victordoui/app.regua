import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BlockedSlot {
  id: string;
  user_id: string;
  barber_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
  created_at: string;
}

export interface BlockedSlotFormData {
  barber_id: string;
  start_datetime: string;
  end_datetime: string;
  reason?: string;
}

export const useBlockedSlots = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBlockedSlots = useCallback(async (): Promise<BlockedSlot[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('blocked_slots')
      .select('*')
      .eq('user_id', user.id)
      .order('start_datetime', { ascending: true });

    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: blockedSlots = [], isLoading, error } = useQuery({
    queryKey: ['blocked_slots', user?.id],
    queryFn: fetchBlockedSlots,
    enabled: !!user
  });

  const addBlockedSlotMutation = useMutation({
    mutationFn: async (formData: BlockedSlotFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('blocked_slots')
        .insert({
          user_id: user.id,
          barber_id: formData.barber_id,
          start_datetime: formData.start_datetime,
          end_datetime: formData.end_datetime,
          reason: formData.reason || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked_slots'] });
      toast({ title: 'Horário bloqueado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao bloquear horário', description: error.message, variant: 'destructive' });
    }
  });

  const deleteBlockedSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('blocked_slots')
        .delete()
        .eq('id', slotId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked_slots'] });
      toast({ title: 'Bloqueio removido!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover bloqueio', description: error.message, variant: 'destructive' });
    }
  });

  const getBlockedSlotsForBarber = (barberId: string, date?: string) => {
    return blockedSlots.filter(slot => {
      const matchesBarber = slot.barber_id === barberId;
      if (!date) return matchesBarber;
      
      const slotDate = new Date(slot.start_datetime).toISOString().split('T')[0];
      return matchesBarber && slotDate === date;
    });
  };

  return {
    blockedSlots,
    isLoading,
    error,
    addBlockedSlot: addBlockedSlotMutation.mutateAsync,
    deleteBlockedSlot: deleteBlockedSlotMutation.mutateAsync,
    getBlockedSlotsForBarber,
    isAdding: addBlockedSlotMutation.isPending,
    isDeleting: deleteBlockedSlotMutation.isPending
  };
};
