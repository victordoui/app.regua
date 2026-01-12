import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WaitlistItem {
  id: string;
  user_id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  service_id: string | null;
  barber_id: string | null;
  preferred_date: string | null;
  preferred_time_start: string | null;
  preferred_time_end: string | null;
  status: 'waiting' | 'notified' | 'booked' | 'expired';
  notified_at: string | null;
  created_at: string;
  service?: { name: string } | null;
  barber?: { display_name: string } | null;
}

export interface WaitlistFormData {
  client_id?: string;
  client_name: string;
  client_phone: string;
  service_id?: string;
  barber_id?: string;
  preferred_date?: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
}

export const useWaitlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchWaitlist = useCallback(async (): Promise<WaitlistItem[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with related data
    const serviceIds = [...new Set(data?.map(w => w.service_id).filter(Boolean))];
    const barberIds = [...new Set(data?.map(w => w.barber_id).filter(Boolean))];

    const [servicesRes, barbersRes] = await Promise.all([
      serviceIds.length > 0 
        ? supabase.from('services').select('id, name').in('id', serviceIds)
        : { data: [] },
      barberIds.length > 0
        ? supabase.from('profiles').select('id, display_name').in('id', barberIds)
        : { data: [] }
    ]);

    const servicesMap = new Map<string, { id: string; name: string }>();
    servicesRes.data?.forEach(s => servicesMap.set(s.id, s));
    const barbersMap = new Map<string, { id: string; display_name: string }>();
    barbersRes.data?.forEach(b => barbersMap.set(b.id, b));

    return (data || []).map(item => ({
      ...item,
      status: item.status as WaitlistItem['status'],
      service: item.service_id ? servicesMap.get(item.service_id) || null : null,
      barber: item.barber_id ? barbersMap.get(item.barber_id) || null : null
    }));
  }, [user]);

  const { data: waitlist = [], isLoading, error } = useQuery({
    queryKey: ['waitlist', user?.id],
    queryFn: fetchWaitlist,
    enabled: !!user
  });

  const addToWaitlistMutation = useMutation({
    mutationFn: async (formData: WaitlistFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('waitlist')
        .insert({
          user_id: user.id,
          client_id: formData.client_id || null,
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          service_id: formData.service_id || null,
          barber_id: formData.barber_id || null,
          preferred_date: formData.preferred_date || null,
          preferred_time_start: formData.preferred_time_start || null,
          preferred_time_end: formData.preferred_time_end || null,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      toast({ title: 'Cliente adicionado à lista de espera!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar à lista', description: error.message, variant: 'destructive' });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WaitlistItem['status'] }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const updates: Record<string, any> = { status };
      if (status === 'notified') {
        updates.notified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('waitlist')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      const messages: Record<string, string> = {
        notified: 'Cliente notificado!',
        booked: 'Agendamento realizado!',
        expired: 'Entrada expirada.'
      };
      toast({ title: messages[status] || 'Status atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    }
  });

  const removeFromWaitlistMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      toast({ title: 'Removido da lista de espera!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    }
  });

  // Stats
  const stats = {
    waiting: waitlist.filter(w => w.status === 'waiting').length,
    notified: waitlist.filter(w => w.status === 'notified').length,
    booked: waitlist.filter(w => w.status === 'booked').length,
    total: waitlist.length
  };

  return {
    waitlist,
    stats,
    isLoading,
    error,
    addToWaitlist: addToWaitlistMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    removeFromWaitlist: removeFromWaitlistMutation.mutateAsync,
    isAdding: addToWaitlistMutation.isPending,
    isUpdating: updateStatusMutation.isPending
  };
};
