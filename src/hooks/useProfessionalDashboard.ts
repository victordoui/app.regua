import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endOfMonth, startOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { addBusinessCalendarDays, businessDateTimeToISOString, formatBusinessDateInput, getBusinessMonthDateRange } from '@/lib/formatters';
import { splitProfessionalAppointments, sumCompletedTips } from '@/lib/professionalDashboardMetrics';
import { estimateBusinessOccupancyPercent } from '@/lib/dashboardOccupancy';

type AppointmentRow = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_id: string;
  total_price: number | null;
  tip_amount: number | null;
};
type ServiceRow = { id: string; name: string; price: number; duration_minutes: number };
type ShiftRow = {
  day_of_week: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_recurring: boolean;
  status: string;
};
type CommissionRow = { amount: number; status: string | null };
type GoalRow = { id: string; target_value: number; period_start: string; period_end: string };
type AppointmentServiceRow = { appointment_id: string; service_id: string; price: number };

export type ProfessionalDashboardData = {
  professionalName: string;
  todayAppointments: AppointmentRow[];
  upcomingAppointments: AppointmentRow[];
  servicesById: Map<string, ServiceRow>;
  monthlyRevenue: number;
  monthlyTips: number;
  completedCount: number;
  averageTicket: number;
  occupancy: number | null;
  noShows: number;
  pendingCommission: number;
  paidCommission: number;
  topServices: Array<{ id: string; name: string; count: number; revenue: number }>;
  monthlyGoal: GoalRow | null;
};

const dateKey = (date: Date) => formatBusinessDateInput(date);
const timeMinutes = (value: string | null) => {
  if (!value) return 0;
  const [hours, minutes] = value.slice(0, 5).split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : 0;
};

function availableMinutesForDay(date: Date, shifts: ShiftRow[]) {
  const key = dateKey(date);
  const specific = shifts.find((shift) => !shift.is_recurring && shift.specific_date === key);
  const shift = specific ?? shifts.find((item) => item.is_recurring && item.day_of_week === date.getDay());
  if (!shift || shift.status !== 'active') return 0;
  const gross = Math.max(0, timeMinutes(shift.end_time) - timeMinutes(shift.start_time));
  const pause = shift.break_start && shift.break_end
    ? Math.max(0, timeMinutes(shift.break_end) - timeMinutes(shift.break_start))
    : 0;
  return Math.max(0, gross - pause);
}

function daysInPeriod(start: Date, end: Date) {
  const days: Date[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(new Date(cursor));
  }
  return days;
}

export function useProfessionalDashboard() {
  const { user } = useAuth();
  const { businessId, teamProfileId } = useRole();
  const queryClient = useQueryClient();
  const today = new Date();
  const todayString = dateKey(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthRange = getBusinessMonthDateRange(today);
  const monthStartString = monthRange.start;
  const monthEndString = monthRange.end;

  const dashboard = useQuery({
    queryKey: ['professional-dashboard', user?.id, businessId, teamProfileId, monthStartString],
    enabled: Boolean(user && businessId && teamProfileId),
    staleTime: 30_000,
    queryFn: async (): Promise<ProfessionalDashboardData> => {
      if (!user || !businessId || !teamProfileId) throw new Error('Seu acesso ainda não está vinculado a um perfil profissional.');

      const [profileResult, appointmentsResult, shiftsResult, commissionsResult, goalResult] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', teamProfileId).eq('user_id', businessId).maybeSingle(),
        supabase.from('appointments').select('id,appointment_date,appointment_time,status,service_id,total_price,tip_amount').eq('user_id', businessId).eq('barbeiro_id', teamProfileId).gte('appointment_date', monthStartString).lte('appointment_date', addBusinessCalendarDays(todayString, 30)).order('appointment_date').order('appointment_time'),
        supabase.from('barber_shifts').select('day_of_week,specific_date,start_time,end_time,break_start,break_end,is_recurring,status').eq('user_id', businessId).eq('barber_id', teamProfileId),
        supabase.from('commissions').select('amount,status').eq('user_id', businessId).eq('barber_id', teamProfileId).gte('created_at', businessDateTimeToISOString(monthStartString)).lt('created_at', businessDateTimeToISOString(addBusinessCalendarDays(monthEndString, 1))),
        supabase.from('barbeiro_goals').select('id,target_value,period_start,period_end').eq('barbeiro_id', teamProfileId).eq('goal_type', 'monthly_revenue').lte('period_start', todayString).gte('period_end', todayString).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const failures = [profileResult, appointmentsResult, shiftsResult, commissionsResult, goalResult].filter((result) => result.error);
      if (failures.length) throw failures[0].error;

      const appointments = (appointmentsResult.data || []) as AppointmentRow[];
      const appointmentBuckets = splitProfessionalAppointments(appointments, todayString, monthStartString, monthEndString);
      const shifts = (shiftsResult.data || []) as ShiftRow[];
      const commissions = (commissionsResult.data || []) as CommissionRow[];
      const serviceIds = [...new Set(appointments.map((appointment) => appointment.service_id))];
      const appointmentIds = appointments.map((appointment) => appointment.id);
      const [servicesResult, appointmentServicesResult] = await Promise.all([
        serviceIds.length
          ? supabase.from('services').select('id,name,price,duration_minutes').eq('user_id', businessId).in('id', serviceIds)
          : Promise.resolve({ data: [], error: null }),
        appointmentIds.length
          ? supabase.from('appointment_services').select('appointment_id,service_id,price').in('appointment_id', appointmentIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (servicesResult.error) throw servicesResult.error;
      if (appointmentServicesResult.error) throw appointmentServicesResult.error;

      const services = (servicesResult.data || []) as ServiceRow[];
      const servicesById = new Map(services.map((service) => [service.id, service]));
      const appointmentServices = (appointmentServicesResult.data || []) as AppointmentServiceRow[];
      const monthToDateAppointments = appointmentBuckets.monthToDate;
      const completed = monthToDateAppointments.filter((appointment) => appointment.status === 'completed');
      const completedRevenue = completed.reduce((sum, appointment) => sum + Number(appointment.total_price ?? servicesById.get(appointment.service_id)?.price ?? 0), 0);
      const monthlyTips = sumCompletedTips(completed);
      const todayAppointments = appointmentBuckets.today;
      const upcomingAppointments = appointmentBuckets.upcoming;

      const completedIds = new Set(completed.map((appointment) => appointment.id));
      const serviceTotals = new Map<string, { count: number; revenue: number }>();
      const appointmentServiceGroups = new Map<string, AppointmentServiceRow[]>();
      appointmentServices.forEach((item) => {
        const group = appointmentServiceGroups.get(item.appointment_id) || [];
        group.push(item);
        appointmentServiceGroups.set(item.appointment_id, group);
      });
      completed.forEach((appointment) => {
        const items = appointmentServiceGroups.get(appointment.id);
        if (items?.length) {
          items.forEach((item) => {
            const serviceTotal = serviceTotals.get(item.service_id) || { count: 0, revenue: 0 };
            serviceTotal.count += 1;
            serviceTotal.revenue += Number(item.price || 0);
            serviceTotals.set(item.service_id, serviceTotal);
          });
        } else {
          const serviceTotal = serviceTotals.get(appointment.service_id) || { count: 0, revenue: 0 };
          serviceTotal.count += 1;
          serviceTotal.revenue += Number(appointment.total_price ?? servicesById.get(appointment.service_id)?.price ?? 0);
          serviceTotals.set(appointment.service_id, serviceTotal);
        }
      });
      const topServices = [...serviceTotals.entries()]
        .map(([id, total]) => ({ id, name: servicesById.get(id)?.name || 'Serviço', ...total }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const operatingDays = daysInPeriod(monthStart, monthEnd);
      const available = operatingDays.reduce((sum, day) => sum + availableMinutesForDay(day, shifts), 0);
      const occupied = appointmentBuckets.monthBookings
        .reduce((sum, appointment) => sum + (servicesById.get(appointment.service_id)?.duration_minutes || 0), 0);
      const occupancy = estimateBusinessOccupancyPercent(occupied, available);

      return {
        professionalName: profileResult.data?.display_name || 'Profissional',
        todayAppointments,
        upcomingAppointments,
        servicesById,
        monthlyRevenue: completedRevenue,
        monthlyTips,
        completedCount: completed.length,
        averageTicket: completed.length ? completedRevenue / completed.length : 0,
        occupancy,
        noShows: appointmentBuckets.noShows,
        pendingCommission: commissions.filter((commission) => commission.status === 'pending').reduce((sum, commission) => sum + Number(commission.amount || 0), 0),
        paidCommission: commissions.filter((commission) => commission.status === 'paid').reduce((sum, commission) => sum + Number(commission.amount || 0), 0),
        topServices,
        monthlyGoal: (goalResult.data as GoalRow | null) || null,
      };
    },
  });

  const saveGoal = useMutation({
    mutationFn: async (target: number) => {
      if (!teamProfileId || !Number.isFinite(target) || target <= 0) throw new Error('Informe um valor de meta maior que zero.');
      const goal = dashboard.data?.monthlyGoal;
      const payload = {
        target_value: target,
        current_value: dashboard.data?.monthlyRevenue || 0,
        period_start: monthStartString,
        period_end: monthEndString,
      };
      const result = goal
        ? await supabase.from('barbeiro_goals').update(payload).eq('id', goal.id).select('id,target_value,period_start,period_end').single()
        : await supabase.from('barbeiro_goals').insert({ ...payload, barbeiro_id: teamProfileId, goal_type: 'monthly_revenue' }).select('id,target_value,period_start,period_end').single();
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professional-dashboard', user?.id, businessId, teamProfileId, monthStartString] }),
  });

  return { ...dashboard, saveGoal };
}
