import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, subMonths, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface SalesData {
  date: string;
  revenue: number;
  appointments: number;
  ticketMedio: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface ServiceSalesData {
  id: string;
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export type DateRangeType = 'today' | 'week' | 'month' | 'year' | 'custom';

export const useSalesReports = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRangeType>('month');
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
      case 'week':
        return { 
          start: format(startOfWeek(now, { locale: ptBR }), 'yyyy-MM-dd'), 
          end: format(endOfWeek(now, { locale: ptBR }), 'yyyy-MM-dd') 
        };
      case 'month':
        return { 
          start: format(startOfMonth(now), 'yyyy-MM-dd'), 
          end: format(endOfMonth(now), 'yyyy-MM-dd') 
        };
      case 'year':
        return { 
          start: format(startOfYear(now), 'yyyy-MM-dd'), 
          end: format(endOfYear(now), 'yyyy-MM-dd') 
        };
      case 'custom':
        return {
          start: customStart ? format(customStart, 'yyyy-MM-dd') : format(startOfMonth(now), 'yyyy-MM-dd'),
          end: customEnd ? format(customEnd, 'yyyy-MM-dd') : format(endOfMonth(now), 'yyyy-MM-dd')
        };
      default:
        return { 
          start: format(startOfMonth(now), 'yyyy-MM-dd'), 
          end: format(endOfMonth(now), 'yyyy-MM-dd') 
        };
    }
  }, [dateRange, customStart, customEnd]);

  const fetchSalesData = useCallback(async () => {
    if (!user) return null;

    const { start, end } = getDateRange();

    // Fetch completed appointments with revenue
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id, 
        appointment_date, 
        total_price, 
        status, 
        service_id,
        services(id, name, price)
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .order('appointment_date', { ascending: true });

    if (error) throw error;

    // Calculate daily/weekly/monthly revenue
    const revenueByDate = new Map<string, { revenue: number; appointments: number }>();
    const serviceStats = new Map<string, { name: string; count: number; revenue: number }>();

    (appointments || []).forEach(apt => {
      const date = apt.appointment_date;
      const existing = revenueByDate.get(date) || { revenue: 0, appointments: 0 };
      revenueByDate.set(date, {
        revenue: existing.revenue + (apt.total_price || 0),
        appointments: existing.appointments + 1
      });

      // Service stats
      if (apt.services) {
        const service = apt.services as { id: string; name: string; price: number };
        const existingService = serviceStats.get(service.id) || { name: service.name, count: 0, revenue: 0 };
        serviceStats.set(service.id, {
          name: service.name,
          count: existingService.count + 1,
          revenue: existingService.revenue + (apt.total_price || service.price || 0)
        });
      }
    });

    // Convert to array
    const salesData: SalesData[] = Array.from(revenueByDate.entries()).map(([date, data]) => ({
      date: format(parseISO(date), 'dd/MM', { locale: ptBR }),
      revenue: data.revenue,
      appointments: data.appointments,
      ticketMedio: data.appointments > 0 ? data.revenue / data.appointments : 0
    }));

    // Calculate totals
    const totalRevenue = appointments?.reduce((sum, a) => sum + (a.total_price || 0), 0) || 0;
    const totalAppointments = appointments?.length || 0;
    const ticketMedio = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    // Service rankings
    const serviceSales: ServiceSalesData[] = Array.from(serviceStats.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Previous period comparison
    const prevStart = format(subMonths(parseISO(start), 1), 'yyyy-MM-dd');
    const prevEnd = format(subMonths(parseISO(end), 1), 'yyyy-MM-dd');
    
    const { data: prevAppointments } = await supabase
      .from('appointments')
      .select('total_price')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('appointment_date', prevStart)
      .lte('appointment_date', prevEnd);

    const prevTotalRevenue = prevAppointments?.reduce((sum, a) => sum + (a.total_price || 0), 0) || 0;
    const revenueGrowth = prevTotalRevenue > 0 
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
      : 0;

    return {
      salesData,
      serviceSales,
      summary: {
        totalRevenue,
        totalAppointments,
        ticketMedio,
        revenueGrowth,
        prevTotalRevenue
      }
    };
  }, [user, getDateRange]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-reports', user?.id, dateRange, customStart, customEnd],
    queryFn: fetchSalesData,
    enabled: !!user
  });

  return {
    salesData: data?.salesData || [],
    serviceSales: data?.serviceSales || [],
    summary: data?.summary || {
      totalRevenue: 0,
      totalAppointments: 0,
      ticketMedio: 0,
      revenueGrowth: 0,
      prevTotalRevenue: 0
    },
    isLoading,
    error,
    refetch,
    dateRange,
    setDateRange,
    setCustomStart,
    setCustomEnd,
    getDateRange
  };
};
