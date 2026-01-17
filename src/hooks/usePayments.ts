import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Payment {
  id: string;
  user_id: string;
  appointment_id: string | null;
  amount: number;
  payment_method: string | null;
  status: 'pending' | 'completed' | 'refunded';
  stripe_payment_id: string | null;
  pix_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  appointment_id?: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'pix' | 'stripe';
  status?: 'pending' | 'completed' | 'refunded';
}

export const usePayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchPayments = useCallback(async (): Promise<Payment[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Payment[];
  }, [user]);

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: fetchPayments,
    enabled: !!user
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (formData: PaymentFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          appointment_id: formData.appointment_id || null,
          amount: formData.amount,
          payment_method: formData.payment_method,
          status: formData.status || 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Pagamento registrado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar pagamento', description: error.message, variant: 'destructive' });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'completed' | 'refunded' }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Status atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    }
  });

  const getPaymentForAppointment = (appointmentId: string): Payment | undefined => {
    return payments.find(p => p.appointment_id === appointmentId);
  };

  const getTotalRevenue = (startDate?: string, endDate?: string): number => {
    return payments
      .filter(p => {
        if (p.status !== 'completed') return false;
        if (startDate && p.created_at < startDate) return false;
        if (endDate && p.created_at > endDate) return false;
        return true;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return {
    payments,
    isLoading,
    error,
    addPayment: addPaymentMutation.mutateAsync,
    updatePaymentStatus: updatePaymentStatusMutation.mutateAsync,
    getPaymentForAppointment,
    getTotalRevenue,
    isAdding: addPaymentMutation.isPending,
    isUpdating: updatePaymentStatusMutation.isPending
  };
};
