import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types/appointments';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Appointment;
  old: Appointment;
}

export const useRealtimeAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch initial appointments
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (id, first_name, last_name, phone, email),
          services:service_id (id, name, price, duration_minutes),
          barbers:barbeiro_id (id, full_name)
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      const formattedAppointments = (data || []).map(apt => ({
        ...apt,
        clients: apt.clients ? {
          ...apt.clients,
          name: `${apt.clients.first_name || ''} ${apt.clients.last_name || ''}`.trim()
        } : undefined
      }));

      setAppointments(formattedAppointments);
      
      // Filter today's appointments
      const today = formattedAppointments.filter(apt => 
        isToday(parseISO(apt.appointment_date))
      );
      setTodayAppointments(today);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Handle realtime changes
  const handleRealtimeChange = useCallback((payload: RealtimePayload) => {
    console.log('Realtime appointment change:', payload.eventType, payload);
    
    setLastUpdate(new Date());
    
    // Invalidate React Query cache
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });

    if (payload.eventType === 'INSERT') {
      const newAppointment = payload.new;
      
      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
      
      // Format date for display
      const formattedDate = format(parseISO(newAppointment.appointment_date), "dd 'de' MMMM", { locale: ptBR });
      
      // Show detailed toast for new appointment
      toast({
        title: "🎉 Novo Agendamento na Marshals Barber!",
        description: `📅 ${formattedDate} às ${newAppointment.appointment_time} • Um cliente acabou de agendar!`,
        duration: 8000,
      });

      // Refetch to get complete data with joins
      fetchAppointments();
    } else if (payload.eventType === 'UPDATE') {
      // Refetch to get updated data
      fetchAppointments();
    } else if (payload.eventType === 'DELETE') {
      const deletedId = payload.old.id;
      
      setAppointments(prev => prev.filter(apt => apt.id !== deletedId));
      setTodayAppointments(prev => prev.filter(apt => apt.id !== deletedId));
    }
  }, [fetchAppointments, queryClient, toast]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchAppointments();

    // Setup realtime channel
    const channel = supabase
      .channel('realtime-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleRealtimeChange(payload as unknown as RealtimePayload);
        }
      )
      .subscribe((status) => {
        console.log('Realtime appointments channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up realtime appointments channel');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchAppointments, handleRealtimeChange]);

  // Get appointments by status
  const getAppointmentsByStatus = useCallback((status: string) => {
    return appointments.filter(apt => apt.status === status);
  }, [appointments]);

  // Get appointments for a specific date
  const getAppointmentsByDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  }, [appointments]);

  // Stats calculations
  const stats = {
    total: appointments.length,
    today: todayAppointments.length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
  };

  return {
    appointments,
    todayAppointments,
    isLoading,
    isConnected,
    lastUpdate,
    stats,
    refetch: fetchAppointments,
    getAppointmentsByStatus,
    getAppointmentsByDate,
  };
};
