import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BarberAbsence {
  id: string;
  user_id: string;
  barber_id: string;
  start_date: string;
  end_date: string;
  type: string;
  notes: string | null;
  created_at: string;
}

export interface BarberAbsenceFormData {
  barber_id: string;
  start_date: string;
  end_date: string;
  type: 'vacation' | 'sick' | 'personal';
  notes?: string;
}

export const ABSENCE_TYPES = {
  vacation: { label: 'Férias', color: 'blue' },
  sick: { label: 'Atestado', color: 'red' },
  personal: { label: 'Pessoal', color: 'orange' }
};

export const useBarberAbsences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchAbsences = useCallback(async (): Promise<BarberAbsence[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('barber_absences')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: absences = [], isLoading, error } = useQuery({
    queryKey: ['barber_absences', user?.id],
    queryFn: fetchAbsences,
    enabled: !!user
  });

  const addAbsenceMutation = useMutation({
    mutationFn: async (formData: BarberAbsenceFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('barber_absences')
        .insert({
          user_id: user.id,
          barber_id: formData.barber_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          type: formData.type,
          notes: formData.notes || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber_absences'] });
      toast({ title: 'Ausência registrada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar ausência', description: error.message, variant: 'destructive' });
    }
  });

  const updateAbsenceMutation = useMutation({
    mutationFn: async ({ id, ...formData }: Partial<BarberAbsenceFormData> & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('barber_absences')
        .update({
          start_date: formData.start_date,
          end_date: formData.end_date,
          type: formData.type,
          notes: formData.notes
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber_absences'] });
      toast({ title: 'Ausência atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar ausência', description: error.message, variant: 'destructive' });
    }
  });

  const deleteAbsenceMutation = useMutation({
    mutationFn: async (absenceId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('barber_absences')
        .delete()
        .eq('id', absenceId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber_absences'] });
      toast({ title: 'Ausência removida!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover ausência', description: error.message, variant: 'destructive' });
    }
  });

  const getAbsencesForBarber = (barberId: string) => {
    return absences.filter(a => a.barber_id === barberId);
  };

  const isBarberAbsent = (barberId: string, date: string) => {
    return absences.some(a => 
      a.barber_id === barberId && 
      date >= a.start_date && 
      date <= a.end_date
    );
  };

  return {
    absences,
    isLoading,
    error,
    addAbsence: addAbsenceMutation.mutateAsync,
    updateAbsence: updateAbsenceMutation.mutateAsync,
    deleteAbsence: deleteAbsenceMutation.mutateAsync,
    getAbsencesForBarber,
    isBarberAbsent,
    isAdding: addAbsenceMutation.isPending,
    isUpdating: updateAbsenceMutation.isPending,
    isDeleting: deleteAbsenceMutation.isPending
  };
};
