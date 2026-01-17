import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

// This hook provides shift management functionality
// Note: Requires 'barber_shifts' table to be created in Supabase
export function useShifts() {
  const { toast } = useToast();
  const [shifts] = useState<BarberShift[]>([]);
  const [isLoading] = useState(false);

  const createShift = {
    mutate: async (_input: CreateShiftInput) => null,
    mutateAsync: async (_input: CreateShiftInput) => null,
    isPending: false
  };

  const updateShift = {
    mutate: async (_data: Partial<BarberShift> & { id: string }) => {},
    mutateAsync: async (_data: Partial<BarberShift> & { id: string }) => {},
    isPending: false
  };

  const deleteShift = {
    mutate: async (_id: string) => {},
    mutateAsync: async (_id: string) => {},
    isPending: false
  };

  // Get shifts for a specific barber
  const getBarberShifts = useCallback((barberId: string) => {
    return shifts.filter(s => s.barber_id === barberId);
  }, [shifts]);

  // Get weekly schedule for a barber
  const getWeeklySchedule = useCallback((barberId: string) => {
    const barberShifts = getBarberShifts(barberId);
    const schedule: Record<number, BarberShift[]> = {};

    for (let i = 0; i < 7; i++) {
      schedule[i] = barberShifts.filter(
        s => s.is_recurring && s.day_of_week === i
      );
    }

    return schedule;
  }, [getBarberShifts]);

  // Check if a barber is working at a specific date/time
  const isBarberWorking = useCallback((_barberId: string, _date: Date, _time: string): boolean => {
    // Without the barber_shifts table, assume all barbers are working
    return true;
  }, []);

  // Get available hours for a barber on a specific date
  const getAvailableHours = useCallback((_barberId: string, _date: Date): string[] => {
    // Return default business hours
    const hours: string[] = [];
    for (let h = 9; h < 19; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
      hours.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return hours;
  }, []);

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
