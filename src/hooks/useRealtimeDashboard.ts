import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, subMonths, isToday, parseISO, subDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardMetrics {
  todayAppointments: number;
  monthAppointments: number;
  monthRevenue: number;
  totalClients: number;
  newClientsThisMonth: number;
  completedRate: number;
  occupancyRate: number;
  activeSubscriptions: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface WeeklyAppointments {
  date: string;
  count: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'client' | 'subscription' | 'payment';
  title: string;
  description: string;
  timestamp: Date;
}

export const useRealtimeDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayAppointments: 0,
    monthAppointments: 0,
    monthRevenue: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    completedRate: 0,
    occupancyRate: 0,
    activeSubscriptions: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState<WeeklyAppointments[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
      const todayStr = format(now, 'yyyy-MM-dd');

      // Parallel queries
      const [
        appointmentsResult,
        todayResult,
        clientsResult,
        subscriptionsResult,
        last6MonthsResult
      ] = await Promise.all([
        // Month appointments
        supabase
          .from('appointments')
          .select('id, status, total_price, appointment_date, appointment_time, created_at')
          .eq('user_id', user.id)
          .gte('appointment_date', monthStart)
          .lte('appointment_date', monthEnd),
        
        // Today's appointments
        supabase
          .from('appointments')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('appointment_date', todayStr),
        
        // Clients
        supabase
          .from('clients')
          .select('id, created_at')
          .eq('user_id', user.id),
        
        // Active subscriptions
        supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        
        // Last 6 months revenue
        supabase
          .from('appointments')
          .select('total_price, appointment_date, status')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('appointment_date', format(subMonths(now, 5), 'yyyy-MM-dd'))
      ]);

      // Calculate metrics
      const monthAppts = appointmentsResult.data || [];
      const todayAppts = todayResult.data || [];
      const clients = clientsResult.data || [];
      const subscriptions = subscriptionsResult.data || [];
      const revenueData = last6MonthsResult.data || [];

      // Month revenue (completed only)
      const monthRevenue = monthAppts
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.total_price || 0), 0);

      // Completed rate
      const completedAppts = monthAppts.filter(a => a.status === 'completed').length;
      const completedRate = monthAppts.length > 0 
        ? Math.round((completedAppts / monthAppts.length) * 100) 
        : 0;

      // New clients this month
      const newClients = clients.filter(c => {
        const createdDate = parseISO(c.created_at);
        return createdDate >= startOfMonth(now) && createdDate <= endOfMonth(now);
      }).length;

      // Occupancy rate (simplified: appointments / business hours)
      const businessHoursPerDay = 10; // 9am-7pm
      const workDays = 26; // ~26 days per month
      const maxSlots = businessHoursPerDay * workDays;
      const occupancyRate = Math.min(Math.round((monthAppts.length / maxSlots) * 100), 100);

      setMetrics({
        todayAppointments: todayAppts.length,
        monthAppointments: monthAppts.length,
        monthRevenue,
        totalClients: clients.length,
        newClientsThisMonth: newClients,
        completedRate,
        occupancyRate,
        activeSubscriptions: subscriptions.length,
      });

      // Calculate monthly revenue for chart
      const revenueByMonth: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        const monthLabel = format(monthDate, 'MMM', { locale: ptBR });
        revenueByMonth[monthKey] = 0;
      }

      revenueData.forEach(apt => {
        const monthKey = format(parseISO(apt.appointment_date), 'yyyy-MM');
        if (revenueByMonth[monthKey] !== undefined) {
          revenueByMonth[monthKey] += apt.total_price || 0;
        }
      });

      const monthlyRevenueData = Object.entries(revenueByMonth).map(([key, revenue]) => ({
        month: format(parseISO(`${key}-01`), 'MMM', { locale: ptBR }),
        revenue
      }));
      setMonthlyRevenue(monthlyRevenueData);

      // Calculate weekly appointments for chart
      const weeklyData: Record<string, number> = {};
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      for (let i = 6; i >= 0; i--) {
        const day = subDays(now, i);
        const dayKey = format(day, 'yyyy-MM-dd');
        weeklyData[dayKey] = 0;
      }

      monthAppts.forEach(apt => {
        if (weeklyData[apt.appointment_date] !== undefined) {
          weeklyData[apt.appointment_date]++;
        }
      });

      const weeklyApptsData = Object.entries(weeklyData).map(([date]) => ({
        date: dayNames[parseISO(date).getDay()],
        count: weeklyData[date]
      }));
      setWeeklyAppointments(weeklyApptsData);

      // Recent activities (last 10 appointments)
      const activities: RecentActivity[] = monthAppts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(apt => ({
          id: apt.id,
          type: 'appointment' as const,
          title: 'Novo Agendamento',
          description: `${format(parseISO(apt.appointment_date), 'dd/MM')} às ${apt.appointment_time}`,
          timestamp: new Date(apt.created_at)
        }));
      setRecentActivities(activities);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Handle realtime changes
  const handleRealtimeChange = useCallback((table: string, eventType: string) => {
    console.log(`Realtime ${table} change:`, eventType);
    setLastUpdate(new Date());
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    
    // Debounced refetch
    fetchDashboardData();
  }, [fetchDashboardData, queryClient]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchDashboardData();

    // Setup realtime channels
    const appointmentsChannel = supabase
      .channel('dashboard-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => handleRealtimeChange('appointments', payload.eventType)
      )
      .subscribe((status) => {
        console.log('Dashboard appointments channel:', status);
        if (status === 'SUBSCRIBED') setIsConnected(true);
      });

    const clientsChannel = supabase
      .channel('dashboard-clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => handleRealtimeChange('clients', payload.eventType)
      )
      .subscribe();

    const subscriptionsChannel = supabase
      .channel('dashboard-subscriptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => handleRealtimeChange('subscriptions', payload.eventType)
      )
      .subscribe();

    return () => {
      console.log('Cleaning up dashboard realtime channels');
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [user?.id, fetchDashboardData, handleRealtimeChange]);

  return {
    metrics,
    monthlyRevenue,
    weeklyAppointments,
    recentActivities,
    isLoading,
    isConnected,
    lastUpdate,
    refetch: fetchDashboardData,
  };
};
