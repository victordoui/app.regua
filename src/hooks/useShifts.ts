import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, getDay, parse, isWithinInterval, addMinutes } from 'date-fns';

export interface BarberShift {
  id: string;
  user_id: string;
  barber_id: string;
  day_of_week: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  break_start: string | null;
  break_end: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
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

export interface UpdateShiftInput {
  id: string;
  start_time?: string;
  end_time?: string;
  break_start?: string | null;
  break_end?: string | null;
  status?: 'active' | 'inactive';
}

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

export function useShifts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all shifts
  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['barber_shifts', user?.id],
    queryFn: async (): Promise<BarberShift[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('barber_shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return (data || []) as BarberShift[];
    },
    enabled: !!user
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (input: CreateShiftInput) => {
      if (!user) throw new Error('Usuário não autenticado');

      const isRecurring = input.is_recurring !== false;

      const shiftData = {
        user_id: user.id,
        barber_id: input.barber_id,
        day_of_week: isRecurring ? input.day_of_week : null,
        specific_date: !isRecurring ? input.specific_date : null,
        start_time: input.start_time,
        end_time: input.end_time,
        is_recurring: isRecurring,
        break_start: input.break_start || null,
        break_end: input.break_end || null,
        status: 'active' as const
      };

      const { data, error } = await supabase
        .from('barber_shifts')
        .insert(shiftData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber_shifts'] });
      toast({ title: 'Turno criado com sucesso!' });
    },
    onError: (error: Error) => {
      console.error('Error creating shift:', error);
      if (error.message.includes('idx_unique_recurring_shift')) {
        toast({ 
          title: 'Erro ao criar turno', 
          description: 'Já existe um turno ativo para este barbeiro neste dia da semana.',
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Erro ao criar turno', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    }
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async (input: UpdateShiftInput) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('barber_shifts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber_shifts'] });
      toast({ title: 'Turno atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar turno', description: error.message, variant: 'destructive' });
    }
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('barber_shifts')
        .delete()
        .eq('id', shiftId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber_shifts'] });
      toast({ title: 'Turno removido!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover turno', description: error.message, variant: 'destructive' });
    }
  });

  // Get shifts for a specific barber
  const getBarberShifts = useCallback((barberId: string): BarberShift[] => {
    return shifts.filter(s => s.barber_id === barberId && s.status === 'active');
  }, [shifts]);

  // Get weekly schedule for a barber (recurring shifts organized by day)
  const getWeeklySchedule = useCallback((barberId: string): Record<number, BarberShift | null> => {
    const barberShifts = getBarberShifts(barberId);
    const schedule: Record<number, BarberShift | null> = {};

    for (let i = 0; i < 7; i++) {
      const dayShift = barberShifts.find(
        s => s.is_recurring && s.day_of_week === i
      );
      schedule[i] = dayShift || null;
    }

    return schedule;
  }, [getBarberShifts]);

  // Get shift for a specific date and barber
  const getShiftForDate = useCallback((barberId: string, date: Date): BarberShift | null => {
    const barberShifts = getBarberShifts(barberId);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);

    // First check for specific date exception
    const specificShift = barberShifts.find(
      s => !s.is_recurring && s.specific_date === dateStr
    );
    if (specificShift) return specificShift;

    // Then check for recurring shift
    const recurringShift = barberShifts.find(
      s => s.is_recurring && s.day_of_week === dayOfWeek
    );
    return recurringShift || null;
  }, [getBarberShifts]);

  // Check if a barber is working at a specific date/time
  const isBarberWorking = useCallback((barberId: string, date: Date, time: string): boolean => {
    const shift = getShiftForDate(barberId, date);
    
    // No shift means not working
    if (!shift) return false;

    // Check if time is within shift hours
    const timeDate = parse(time, 'HH:mm', date);
    const shiftStart = parse(shift.start_time.substring(0, 5), 'HH:mm', date);
    const shiftEnd = parse(shift.end_time.substring(0, 5), 'HH:mm', date);

    if (timeDate < shiftStart || timeDate >= shiftEnd) return false;

    // Check if time is during break
    if (shift.break_start && shift.break_end) {
      const breakStart = parse(shift.break_start.substring(0, 5), 'HH:mm', date);
      const breakEnd = parse(shift.break_end.substring(0, 5), 'HH:mm', date);
      
      if (timeDate >= breakStart && timeDate < breakEnd) return false;
    }

    return true;
  }, [getShiftForDate]);

  // Check if a time slot (with duration) fits within shift
  const isSlotWithinShift = useCallback((
    barberId: string, 
    date: Date, 
    time: string, 
    durationMinutes: number
  ): { available: boolean; reason?: string } => {
    const shift = getShiftForDate(barberId, date);
    
    if (!shift) {
      return { available: false, reason: 'Barbeiro não trabalha neste dia' };
    }

    const slotStart = parse(time, 'HH:mm', date);
    const slotEnd = addMinutes(slotStart, durationMinutes);
    const shiftStart = parse(shift.start_time.substring(0, 5), 'HH:mm', date);
    const shiftEnd = parse(shift.end_time.substring(0, 5), 'HH:mm', date);

    // Check if slot starts before shift
    if (slotStart < shiftStart) {
      return { available: false, reason: 'Horário antes do início do turno' };
    }

    // Check if slot ends after shift
    if (slotEnd > shiftEnd) {
      return { available: false, reason: 'Serviço ultrapassa o fim do turno' };
    }

    // Check if slot overlaps with break
    if (shift.break_start && shift.break_end) {
      const breakStart = parse(shift.break_start.substring(0, 5), 'HH:mm', date);
      const breakEnd = parse(shift.break_end.substring(0, 5), 'HH:mm', date);

      // Check if any part of the slot overlaps with break
      const overlapsBreak = (slotStart < breakEnd && slotEnd > breakStart);
      
      if (overlapsBreak) {
        return { available: false, reason: 'Horário durante intervalo' };
      }
    }

    return { available: true };
  }, [getShiftForDate]);

  // Get available hours for a barber on a specific date
  const getAvailableHours = useCallback((barberId: string, date: Date): string[] => {
    const shift = getShiftForDate(barberId, date);
    
    if (!shift) return [];

    const hours: string[] = [];
    const shiftStart = parse(shift.start_time.substring(0, 5), 'HH:mm', date);
    const shiftEnd = parse(shift.end_time.substring(0, 5), 'HH:mm', date);
    
    let breakStart: Date | null = null;
    let breakEnd: Date | null = null;
    
    if (shift.break_start && shift.break_end) {
      breakStart = parse(shift.break_start.substring(0, 5), 'HH:mm', date);
      breakEnd = parse(shift.break_end.substring(0, 5), 'HH:mm', date);
    }

    // Generate 30-minute slots
    let current = shiftStart;
    while (current < shiftEnd) {
      const timeStr = format(current, 'HH:mm');
      
      // Skip if during break
      const isDuringBreak = breakStart && breakEnd && 
        current >= breakStart && current < breakEnd;
      
      if (!isDuringBreak) {
        hours.push(timeStr);
      }
      
      current = addMinutes(current, 30);
    }

    return hours;
  }, [getShiftForDate]);

  // Check if barber has any shifts configured
  const hasShiftsConfigured = useCallback((barberId: string): boolean => {
    return getBarberShifts(barberId).length > 0;
  }, [getBarberShifts]);

  // Get specific date shifts (exceptions) for a barber
  const getSpecificDateShifts = useCallback((barberId: string): BarberShift[] => {
    return shifts.filter(
      s => s.barber_id === barberId && !s.is_recurring && s.status === 'active'
    );
  }, [shifts]);

  return {
    shifts,
    isLoading,
    createShift: {
      mutate: createShiftMutation.mutate,
      mutateAsync: createShiftMutation.mutateAsync,
      isPending: createShiftMutation.isPending
    },
    updateShift: {
      mutate: updateShiftMutation.mutate,
      mutateAsync: updateShiftMutation.mutateAsync,
      isPending: updateShiftMutation.isPending
    },
    deleteShift: {
      mutate: deleteShiftMutation.mutate,
      mutateAsync: deleteShiftMutation.mutateAsync,
      isPending: deleteShiftMutation.isPending
    },
    getBarberShifts,
    getWeeklySchedule,
    getShiftForDate,
    isBarberWorking,
    isSlotWithinShift,
    getAvailableHours,
    hasShiftsConfigured,
    getSpecificDateShifts,
    DAYS_OF_WEEK
  };
}
