import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export interface BarberPerformanceData {
  id: string;
  name: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  cancellationRate: number;
  topServices: { name: string; count: number }[];
}

export interface CancellationAnalysis {
  totalCancelled: number;
  totalNoShow: number;
  cancellationRate: number;
  noShowRate: number;
  byReason: { reason: string; count: number }[];
  byDayOfWeek: { day: string; count: number }[];
}

export const useBarberPerformance = () => {
  const { user } = useAuth();

  const fetchPerformanceData = useCallback(async () => {
    if (!user) return null;

    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

    // Fetch all appointments for the month
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id, 
        barbeiro_id, 
        status, 
        total_price, 
        appointment_date,
        service_id,
        services(id, name)
      `)
      .eq('user_id', user.id)
      .gte('appointment_date', monthStart)
      .lte('appointment_date', monthEnd);

    if (error) throw error;

    // Fetch barbers
    const { data: barbers } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('user_id', user.id)
      .eq('role', 'barbeiro');

    // Fetch reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('barber_id, rating')
      .eq('user_id', user.id);

    // Calculate per-barber performance
    const barberMap = new Map<string, BarberPerformanceData>();
    
    (barbers || []).forEach(barber => {
      barberMap.set(barber.id, {
        id: barber.id,
        name: barber.display_name || 'Barbeiro',
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        totalRevenue: 0,
        averageRating: 0,
        completionRate: 0,
        cancellationRate: 0,
        topServices: []
      });
    });

    // Process appointments
    const serviceCountByBarber = new Map<string, Map<string, { name: string; count: number }>>();
    
    (appointments || []).forEach(apt => {
      if (!apt.barbeiro_id) return;
      
      const barber = barberMap.get(apt.barbeiro_id);
      if (!barber) return;

      barber.totalAppointments++;
      
      if (apt.status === 'completed') {
        barber.completedAppointments++;
        barber.totalRevenue += apt.total_price || 0;
        
        // Track services
        if (apt.services && !Array.isArray(apt.services)) {
          const service = apt.services as unknown as { id: string; name: string };
          if (!serviceCountByBarber.has(apt.barbeiro_id)) {
            serviceCountByBarber.set(apt.barbeiro_id, new Map());
          }
          const serviceMap = serviceCountByBarber.get(apt.barbeiro_id)!;
          const existing = serviceMap.get(service.id) || { name: service.name, count: 0 };
          serviceMap.set(service.id, { name: service.name, count: existing.count + 1 });
        }
      } else if (apt.status === 'cancelled') {
        barber.cancelledAppointments++;
      } else if (apt.status === 'no_show') {
        barber.noShowAppointments++;
      }
    });

    // Calculate rates and add top services
    barberMap.forEach((barber, id) => {
      barber.completionRate = barber.totalAppointments > 0 
        ? (barber.completedAppointments / barber.totalAppointments) * 100 
        : 0;
      barber.cancellationRate = barber.totalAppointments > 0 
        ? (barber.cancelledAppointments / barber.totalAppointments) * 100 
        : 0;

      // Add top services
      const serviceMap = serviceCountByBarber.get(id);
      if (serviceMap) {
        barber.topServices = Array.from(serviceMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
      }
    });

    // Add ratings
    (reviews || []).forEach(review => {
      if (review.barber_id) {
        const barber = barberMap.get(review.barber_id);
        if (barber) {
          // Simple average (would need count tracking for proper average)
          barber.averageRating = review.rating;
        }
      }
    });

    // Sort by revenue
    const performanceData = Array.from(barberMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Cancellation analysis
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const cancellationByDay = new Map<number, number>();
    
    let totalCancelled = 0;
    let totalNoShow = 0;
    
    (appointments || []).forEach(apt => {
      if (apt.status === 'cancelled') {
        totalCancelled++;
        const day = parseISO(apt.appointment_date).getDay();
        cancellationByDay.set(day, (cancellationByDay.get(day) || 0) + 1);
      } else if (apt.status === 'no_show') {
        totalNoShow++;
      }
    });

    const totalAppointments = appointments?.length || 0;
    const cancellationAnalysis: CancellationAnalysis = {
      totalCancelled,
      totalNoShow,
      cancellationRate: totalAppointments > 0 ? (totalCancelled / totalAppointments) * 100 : 0,
      noShowRate: totalAppointments > 0 ? (totalNoShow / totalAppointments) * 100 : 0,
      byReason: [], // Would need reason tracking in appointments
      byDayOfWeek: dayNames.map((day, index) => ({
        day,
        count: cancellationByDay.get(index) || 0
      }))
    };

    return {
      performanceData,
      cancellationAnalysis,
      summary: {
        totalBarbers: performanceData.length,
        totalRevenue: performanceData.reduce((sum, b) => sum + b.totalRevenue, 0),
        avgCompletionRate: performanceData.length > 0 
          ? performanceData.reduce((sum, b) => sum + b.completionRate, 0) / performanceData.length 
          : 0,
        topPerformer: performanceData[0]?.name || 'N/A'
      }
    };
  }, [user]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['barber-performance', user?.id],
    queryFn: fetchPerformanceData,
    enabled: !!user
  });

  return {
    performanceData: data?.performanceData || [],
    cancellationAnalysis: data?.cancellationAnalysis || {
      totalCancelled: 0,
      totalNoShow: 0,
      cancellationRate: 0,
      noShowRate: 0,
      byReason: [],
      byDayOfWeek: []
    },
    summary: data?.summary || {
      totalBarbers: 0,
      totalRevenue: 0,
      avgCompletionRate: 0,
      topPerformer: 'N/A'
    },
    isLoading,
    error,
    refetch
  };
};
