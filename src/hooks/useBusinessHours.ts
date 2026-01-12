import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BusinessHour {
  id: string;
  user_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  created_at: string;
}

export interface BusinessHourFormData {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const useBusinessHours = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBusinessHours = useCallback(async (): Promise<BusinessHour[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: businessHours = [], isLoading, error } = useQuery({
    queryKey: ['business_hours', user?.id],
    queryFn: fetchBusinessHours,
    enabled: !!user
  });

  const upsertBusinessHourMutation = useMutation({
    mutationFn: async (formData: BusinessHourFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('business_hours')
        .upsert({
          user_id: user.id,
          day_of_week: formData.day_of_week,
          open_time: formData.open_time,
          close_time: formData.close_time,
          is_closed: formData.is_closed
        }, { onConflict: 'user_id,day_of_week' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_hours'] });
      toast({ title: 'Horário atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar horário', description: error.message, variant: 'destructive' });
    }
  });

  const initializeBusinessHoursMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const defaultHours = Array.from({ length: 7 }, (_, i) => ({
        user_id: user.id,
        day_of_week: i,
        open_time: i === 0 ? null : '09:00',
        close_time: i === 0 ? null : '19:00',
        is_closed: i === 0
      }));

      const { data, error } = await supabase
        .from('business_hours')
        .upsert(defaultHours, { onConflict: 'user_id,day_of_week' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_hours'] });
      toast({ title: 'Horários inicializados!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao inicializar horários', description: error.message, variant: 'destructive' });
    }
  });

  const getHoursForDay = (dayOfWeek: number): BusinessHour | undefined => {
    return businessHours.find(h => h.day_of_week === dayOfWeek);
  };

  return {
    businessHours,
    isLoading,
    error,
    upsertBusinessHour: upsertBusinessHourMutation.mutateAsync,
    initializeBusinessHours: initializeBusinessHoursMutation.mutateAsync,
    getHoursForDay,
    DAY_NAMES,
    isUpdating: upsertBusinessHourMutation.isPending,
    isInitializing: initializeBusinessHoursMutation.isPending
  };
};
