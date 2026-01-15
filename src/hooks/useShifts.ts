import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BarberShift {
  id: string;
  user_id: string;
  barber_id: string;
  day_of_week: number | null; // 0-6 for recurring shifts
  specific_date: string | null; // for exceptions
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  break_start: string | null;
  break_end: string | null;
  created_at: string;
}

export interface CreateShiftInput {
  barber_id: string;
  day_of_week?: number;
  specific_date?: string;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  break_start?: string;
  break_end?: string;
}

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

export function useShifts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['barber-shifts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('barber_shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('barber_id', { ascending: true });

      if (error) throw error;
      return data as BarberShift[];
    }
  });

  const createShift = useMutation({
    mutationFn: async (input: CreateShiftInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('barber_shifts')
        .insert({
          user_id: user.id,
          ...input,
          is_recurring: input.is_recurring ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-shifts'] });
      toast({
        title: 'Turno Criado',
        description: 'Horário adicionado com sucesso!',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o turno.',
        variant: 'destructive',
      });
    }
  });

  const updateShift = useMutation({
    mutationFn: async ({ id, ...input }: Partial<BarberShift> & { id: string }) => {
      const { error } = await supabase
        .from('barber_shifts')
        .update(input)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-shifts'] });
      toast({
        title: 'Turno Atualizado',
        description: 'Horário atualizado com sucesso!',
      });
    }
  });

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('barber_shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-shifts'] });
      toast({
        title: 'Turno Removido',
        description: 'Horário removido com sucesso!',
      });
    }
  });

  // Get shifts for a specific barber
  const getBarberShifts = (barberId: string) => {
    return shifts.filter(s => s.barber_id === barberId);
  };

  // Get weekly schedule for a barber
  const getWeeklySchedule = (barberId: string) => {
    const barberShifts = getBarberShifts(barberId);
    const schedule: Record<number, BarberShift[]> = {};

    for (let i = 0; i < 7; i++) {
      schedule[i] = barberShifts.filter(
        s => s.is_recurring && s.day_of_week === i
      );
    }

    return schedule;
  };

  // Check if a barber is working at a specific date/time
  const isBarberWorking = (barberId: string, date: Date, time: string): boolean => {
    const barberShifts = getBarberShifts(barberId);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // Check for specific date exception first
    const specificShift = barberShifts.find(
      s => s.specific_date === dateStr
    );

    if (specificShift) {
      return isTimeInRange(time, specificShift.start_time, specificShift.end_time) &&
        !isInBreak(time, specificShift);
    }

    // Check recurring shifts
    const recurringShifts = barberShifts.filter(
      s => s.is_recurring && s.day_of_week === dayOfWeek
    );

    return recurringShifts.some(
      s => isTimeInRange(time, s.start_time, s.end_time) && !isInBreak(time, s)
    );
  };

  const isTimeInRange = (time: string, start: string, end: string): boolean => {
    return time >= start && time <= end;
  };

  const isInBreak = (time: string, shift: BarberShift): boolean => {
    if (!shift.break_start || !shift.break_end) return false;
    return time >= shift.break_start && time <= shift.break_end;
  };

  // Get available hours for a barber on a specific date
  const getAvailableHours = (barberId: string, date: Date): string[] => {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    const barberShifts = getBarberShifts(barberId);

    // Check for specific date first
    const specificShift = barberShifts.find(s => s.specific_date === dateStr);
    
    const targetShifts = specificShift 
      ? [specificShift] 
      : barberShifts.filter(s => s.is_recurring && s.day_of_week === dayOfWeek);

    const hours: string[] = [];

    for (const shift of targetShifts) {
      let currentTime = shift.start_time;
      while (currentTime < shift.end_time) {
        if (!isInBreak(currentTime, shift)) {
          hours.push(currentTime);
        }
        // Add 30 minutes
        const [h, m] = currentTime.split(':').map(Number);
        const totalMinutes = h * 60 + m + 30;
        const newH = Math.floor(totalMinutes / 60);
        const newM = totalMinutes % 60;
        currentTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
      }
    }

    return [...new Set(hours)].sort();
  };

  return {
    shifts,
    isLoading,
    createShift,
    updateShift,
    deleteShift,
    getBarberShifts,
    getWeeklySchedule,
    isBarberWorking,
    getAvailableHours,
    DAYS_OF_WEEK
  };
}
