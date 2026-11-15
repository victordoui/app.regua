import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, endOfMonth, startOfMonth, subDays, subMonths, startOfWeek } from 'date-fns';
import { Activity, CalendarDays, Clock, DollarSign, Package, Star, Users, Wallet } from '@/components/ui/icons';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardFilters } from '@/hooks/useRealtimeDashboard';
import { addBusinessCalendarDays, businessDateKey, businessDateTimeToISOString, formatBusinessDateInput } from '@/lib/formatters';
import { calculateReturnMetrics } from '@/lib/dashboardRetention';
import { buildBookingHeatmap, buildProductRevenueRanking } from '@/lib/dashboardAnalytics';
import { estimateBusinessOccupancyPercent } from '@/lib/dashboardOccupancy';

type Props = { periodMonths: DashboardFilters['periodMonths'] };
type AppointmentRow = {
  id: string; status: string; total_price: number | null; appointment_date: string;
  appointment_time: string; barbeiro_id: string | null; client_id: string; service_id: string;
  booking_source: 'link' | 'whatsapp' | 'balcao' | null;
};
type ServiceRow = { id: string; name: string; duration_minutes: number };
type ProfessionalRow = { id: string; display_name: string | null; active: boolean | null };
type BusinessHourRow = { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean | null };
type RevenueRow = { id: string; sale_date: string; total_amount: number };
type SaleItemRow = { sale_id: string; quantity: number; total_price: number; product_id: string | null };
type ProductRow = { id: string; name: string | null };
type ExpenseRow = { amount: number; due_date: string; status: string };
type CommissionRow = { amount: number; status: string | null; paid_at: string | null; created_at: string | null };
type ClientRow = { id: string; created_at: string };
type ReviewRow = { rating: number; created_at: string };
type GoalRow = { revenue_target: number };

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const percent = (current: number, previous: number) => previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
const dayKey = (date: Date) => formatBusinessDateInput(date);
const minutesFromTime = (value: string | null) => {
  if (!value) return 0;
  const [hours, minutes] = value.split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : 0;
};

function Metric({ label, value, detail, icon: Icon, trend }: { label: string; value: string; detail: string; icon: typeof Activity; trend?: number }) {
  return (
    <article className="dashboard-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-black tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      </div>
      {trend !== undefined && (
        <p className={`mt-3 text-xs font-bold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1).replace('.', ',')}% em relação ao período anterior
        </p>
      )}
    </article>
  );
}

const BusinessPulse = ({ periodMonths }: Props) => {
  const { businessId } = useRole();
  const queryClient = useQueryClient();
  const [goalInput, setGoalInput] = useState('');
  const [goalError, setGoalError] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['owner-dashboard-pulse', businessId, periodMonths],
    enabled: Boolean(businessId),
    staleTime: 30_000,
    queryFn: async () => {
      if (!businessId) throw new Error('Empresa não identificada.');
      const now = new Date();
      const today = formatBusinessDateInput(now);
      const tomorrow = addBusinessCalendarDays(today, 1);
      const currentStart = startOfMonth(subMonths(now, periodMonths - 1));
      const previousStart = startOfMonth(subMonths(currentStart, periodMonths));
      const from = dayKey(previousStart);
      const monthStart = dayKey(startOfMonth(now));
      const [appointmentsResult, clientsResult, servicesResult, professionalsResult, hoursResult, salesResult, expensesResult, commissionsResult, reviewsResult, goalResult] = await Promise.all([
        supabase.from('appointments').select('id,status,total_price,appointment_date,appointment_time,barbeiro_id,client_id,service_id,booking_source').eq('user_id', businessId).gte('appointment_date', from).lte('appointment_date', today),
        supabase.from('clients').select('id,created_at').eq('user_id', businessId),
        supabase.from('services').select('id,name,duration_minutes').eq('user_id', businessId),
        supabase.from('profiles').select('id,display_name,active').eq('user_id', businessId).eq('role', 'barbeiro'),
        supabase.from('business_hours').select('day_of_week,open_time,close_time,is_closed').eq('user_id', businessId),
        supabase.from('sales').select('id,sale_date,total_amount').eq('user_id', businessId).gte('sale_date', businessDateTimeToISOString(from)).lt('sale_date', businessDateTimeToISOString(tomorrow)),
        supabase.from('accounts_transactions').select('amount,due_date,status').eq('user_id', businessId).eq('type', 'payable').eq('status', 'paid').gte('due_date', from).lte('due_date', today),
        supabase.from('commissions').select('amount,status,paid_at,created_at').eq('user_id', businessId),
        supabase.from('reviews').select('rating,created_at').eq('user_id', businessId).gte('created_at', businessDateTimeToISOString(from)).lt('created_at', businessDateTimeToISOString(tomorrow)),
        supabase.from('business_monthly_goals').select('revenue_target').eq('user_id', businessId).eq('month_start', monthStart).maybeSingle(),
      ]);
      const failures = [appointmentsResult, clientsResult, servicesResult, professionalsResult, hoursResult, salesResult, expensesResult, commissionsResult, reviewsResult, goalResult].filter((result) => result.error);
      if (failures.length) throw failures[0].error;

      const appointments = (appointmentsResult.data || []) as AppointmentRow[];
      const clients = (clientsResult.data || []) as ClientRow[];
      const services = (servicesResult.data || []) as ServiceRow[];
      const professionals = (professionalsResult.data || []) as ProfessionalRow[];
      const businessHours = (hoursResult.data || []) as BusinessHourRow[];
      const sales = (salesResult.data || []) as RevenueRow[];
      const expenses = (expensesResult.data || []) as ExpenseRow[];
      const commissions = (commissionsResult.data || []) as CommissionRow[];
      const reviews = (reviewsResult.data || []) as ReviewRow[];
      const monthGoal = Number((goalResult.data as GoalRow | null)?.revenue_target || 0);
      const saleItemsResult = sales.length
        ? await supabase.from('sale_items').select('sale_id,quantity,total_price,product_id').in('sale_id', sales.map((sale) => sale.id))
        : { data: [], error: null };
      if (saleItemsResult.error) throw saleItemsResult.error;
      const saleItems = (saleItemsResult.data || []) as SaleItemRow[];
      const productIds = [...new Set(saleItems.map((item) => item.product_id).filter((id): id is string => Boolean(id)))];
      const productsResult = productIds.length
        ? await supabase.from('products').select('id,name').eq('user_id', businessId).in('id', productIds)
        : { data: [], error: null };
      if (productsResult.error) throw productsResult.error;
      const products = (productsResult.data || []) as ProductRow[];
      const serviceById = new Map(services.map((service) => [service.id, service]));
      const professionalById = new Map(professionals.map((professional) => [professional.id, professional.display_name || 'Profissional']));
      const inRange = (date: string, start: Date, end: Date) => date >= dayKey(start) && date <= dayKey(end);
      const completed = (appointment: AppointmentRow) => appointment.status === 'completed';
      const appointmentRevenue = (rows: AppointmentRow[]) => rows.filter(completed).reduce((sum, appointment) => sum + Number(appointment.total_price || 0), 0);
      const appointmentRevenueFor = (start: Date, end: Date) => appointmentRevenue(appointments.filter((appointment) => inRange(appointment.appointment_date, start, end)));
      const productSalesRevenueFor = (start: Date, end: Date) => {
        const saleIds = new Set(sales.filter((sale) => inRange(businessDateKey(sale.sale_date), start, end)).map((sale) => sale.id));
        return saleItems.filter((item) => item.product_id && saleIds.has(item.sale_id)).reduce((sum, item) => sum + Number(item.total_price || 0), 0);
      };
      // PDV can also record services that were already counted as completed appointments.
      // Include only product items here to avoid counting service revenue twice.
      const grossRevenueFor = (start: Date, end: Date) => appointmentRevenueFor(start, end) + productSalesRevenueFor(start, end);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = subDays(todayStart, 1);
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = subDays(thisWeekStart, 7);
      const lastWeekComparableEnd = subDays(now, 7);
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthComparableEnd = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth(), Math.min(now.getDate(), endOfMonth(lastMonthStart).getDate()));
      const todayRevenue = grossRevenueFor(todayStart, todayStart);
      const yesterdayRevenue = grossRevenueFor(yesterday, yesterday);
      const weekRevenue = grossRevenueFor(thisWeekStart, now);
      const lastWeekRevenue = grossRevenueFor(lastWeekStart, lastWeekComparableEnd);
      const monthRevenue = grossRevenueFor(thisMonthStart, now);
      const lastMonthRevenue = grossRevenueFor(lastMonthStart, lastMonthComparableEnd);
      const currentAppointments = appointments.filter((appointment) => inRange(appointment.appointment_date, currentStart, now));
      const bookingOrigins = [
        { key: 'link', name: 'Link de agendamento' },
        { key: 'whatsapp', name: 'WhatsApp' },
        { key: 'balcao', name: 'Balcão' },
        { key: 'unknown', name: 'Sem informação (histórico)' },
      ].map((origin) => ({
        name: origin.name,
        count: currentAppointments.filter((appointment) =>
          origin.key === 'unknown'
            ? appointment.booking_source == null
            : appointment.booking_source === origin.key,
        ).length,
      }));
      const currentCompleted = currentAppointments.filter(completed);
      const returnMetrics = calculateReturnMetrics(appointments, dayKey(currentStart));
      const newClients = clients.filter((client) => inRange(businessDateKey(client.created_at), currentStart, now)).length;
      const completedCount = currentCompleted.length;
      const averageTicket = completedCount ? appointmentRevenue(currentCompleted) / completedCount : 0;
      const paidExpenses = expenses.filter((expense) => inRange(expense.due_date, thisMonthStart, now)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      const paidCommissions = commissions.filter((commission) => commission.status === 'paid' && commission.paid_at && inRange(businessDateKey(commission.paid_at), thisMonthStart, now)).reduce((sum, commission) => sum + Number(commission.amount || 0), 0);
      const netOperatingResult = monthRevenue - paidExpenses - paidCommissions;
      const pendingCommissions = commissions.filter((commission) => commission.status === 'pending').reduce((sum, commission) => sum + Number(commission.amount || 0), 0);
      const cancelled = currentAppointments.filter((appointment) => appointment.status === 'cancelled').length;
      const noShows = currentAppointments.filter((appointment) => appointment.status === 'no_show').length;
      const currentReviews = reviews.filter((review) => businessDateKey(review.created_at) >= dayKey(currentStart));
      const currentSaleIds = new Set(sales.filter((sale) => inRange(businessDateKey(sale.sale_date), currentStart, now)).map((sale) => sale.id));
      const currentProductItems = saleItems.filter((item) => item.product_id && currentSaleIds.has(item.sale_id));
      const productRanking = buildProductRevenueRanking(currentProductItems, products);
      const bookingHeatmap = buildBookingHeatmap(currentAppointments);
      const averageRating = currentReviews.length ? currentReviews.reduce((sum, review) => sum + review.rating, 0) / currentReviews.length : 0;

      const activeProfessionals = professionals.filter((professional) => professional.active !== false).length;
      const hoursByWeekday = new Map(businessHours.filter((hour) => !hour.is_closed).map((hour) => [hour.day_of_week, Math.max(0, minutesFromTime(hour.close_time) - minutesFromTime(hour.open_time))]));
      const availableMinutes = eachDayOfInterval({ start: currentStart, end: now }).reduce((sum, date) => sum + (hoursByWeekday.get(date.getDay()) || 0) * activeProfessionals, 0);
      const occupiedMinutes = currentAppointments.filter((appointment) => !['cancelled', 'no_show'].includes(appointment.status)).reduce((sum, appointment) => sum + (serviceById.get(appointment.service_id)?.duration_minutes || 0), 0);
      const occupancy = estimateBusinessOccupancyPercent(occupiedMinutes, availableMinutes);

      const serviceTotals = new Map<string, number>();
      const professionalTotals = new Map<string, number>();
      const peakHours = new Map<string, number>();
      for (const appointment of currentCompleted) {
        const amount = Number(appointment.total_price || 0);
        const serviceName = serviceById.get(appointment.service_id)?.name || 'Serviço sem nome';
        serviceTotals.set(serviceName, (serviceTotals.get(serviceName) || 0) + amount);
        if (appointment.barbeiro_id) {
          const professionalName = professionalById.get(appointment.barbeiro_id) || 'Profissional';
          professionalTotals.set(professionalName, (professionalTotals.get(professionalName) || 0) + amount);
        }
      }
      for (const appointment of currentAppointments.filter((item) => !['cancelled', 'no_show'].includes(item.status))) {
        const hour = `${appointment.appointment_time.slice(0, 2)}h`;
        peakHours.set(hour, (peakHours.get(hour) || 0) + 1);
      }
      const toRanking = (totals: Map<string, number>) => [...totals.entries()].map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      return {
        revenueCards: [
    { label: 'Faturamento de hoje', current: todayRevenue, previous: yesterdayRevenue, comparison: 'comparado a ontem' },
          { label: 'Faturamento da semana', current: weekRevenue, previous: lastWeekRevenue, comparison: 'comparado aos mesmos dias da semana passada' },
          { label: 'Faturamento do mês', current: monthRevenue, previous: lastMonthRevenue, comparison: 'comparado ao mesmo período do mês passado' },
        ],
        monthRevenue,
        averageTicket,
        monthGoal,
        occupancy,
        appointmentCount: currentAppointments.length,
        cancellationCount: cancelled,
        noShowCount: noShows,
        newClients,
        returningClients: returnMetrics.returningClients,
        currentClientsCount: returnMetrics.currentClients,
        returnRate: returnMetrics.returnRate,
        pendingCommissions,
        paidExpenses,
        netOperatingResult,
        productSales: productSalesRevenueFor(currentStart, now),
        productUnits: currentProductItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        productRanking,
        averageRating,
        reviewCount: currentReviews.length,
        serviceRanking: toRanking(serviceTotals),
        professionalRanking: toRanking(professionalTotals),
        peakHours: [...peakHours.entries()].map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour.localeCompare(b.hour)),
        bookingHeatmap,
        bookingOrigins,
      };
    },
  });

  const saveGoal = useMutation({
    mutationFn: async (amount: number) => {
      if (!businessId) throw new Error('Empresa não identificada.');
      const { error } = await supabase.from('business_monthly_goals').upsert({
        user_id: businessId,
        month_start: dayKey(startOfMonth(new Date())),
        revenue_target: amount,
      }, { onConflict: 'user_id,month_start' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-dashboard-pulse', businessId, periodMonths] }),
  });

  useEffect(() => {
    if (query.data) setGoalInput(query.data.monthGoal ? query.data.monthGoal.toFixed(2).replace('.', ',') : '');
  }, [query.data]);

  const handleSaveGoal = () => {
    saveGoal.reset();
    if (!goalInput.trim()) {
      setGoalError('Informe a meta de faturamento do mês.');
      return;
    }
    const amount = Number(goalInput.trim().replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(amount) || amount < 0) {
      setGoalError('Informe um valor igual ou maior que zero.');
      return;
    }
    setGoalError(null);
    saveGoal.mutate(amount);
  };

  const currencyTooltip = useMemo(() => ({ formatter: (value: number) => money(value) }), []);
  if (query.isLoading) return <div className="dashboard-surface p-5 text-sm text-muted-foreground">Carregando indicadores de negócio…</div>;
  if (query.error || !query.data) return <div role="alert" className="dashboard-surface p-5 text-sm text-destructive">Não foi possível carregar os indicadores operacionais. Atualize o painel e tente novamente.</div>;

  const data = query.data;
  const operationalMetrics = [
    { label: 'Ticket médio', value: money(data.averageTicket), detail: 'por atendimento concluído', icon: DollarSign },
    { label: 'Ocupação estimada', value: data.occupancy === null ? '—' : `${data.occupancy.toFixed(1).replace('.', ',')}%`, detail: 'horários de funcionamento × equipe ativa', icon: Clock },
    { label: 'Clientes atendidos', value: `${data.currentClientsCount}`, detail: `${data.newClients} novos · ${data.returningClients} recorrentes`, icon: Users },
    { label: 'Taxa de retorno', value: `${data.returnRate}%`, detail: 'clientes com visita anterior', icon: Users },
    { label: 'Cancelamentos e faltas', value: `${data.cancellationCount + data.noShowCount}`, detail: `${data.cancellationCount} cancelamentos · ${data.noShowCount} faltas`, icon: CalendarDays },
    { label: 'Comissões pendentes', value: money(data.pendingCommissions), detail: 'valores ainda não marcados como pagos', icon: Wallet },
    { label: 'Despesas pagas no mês', value: money(data.paidExpenses), detail: `resultado após despesas e comissões pagas: ${money(data.netOperatingResult)}`, icon: Activity },
    { label: 'Produtos vendidos', value: money(data.productSales), detail: `${data.productUnits} unidade(s) no período`, icon: Package },
    { label: 'Avaliações', value: data.averageRating ? `${data.averageRating.toFixed(1).replace('.', ',')} / 5` : '—', detail: `${data.reviewCount} no período`, icon: Star },
  ];

  return (
    <section className="space-y-4" aria-labelledby="business-pulse-title">
      <div>
        <p className="eyebrow">Indicadores do negócio</p>
        <h2 id="business-pulse-title" className="text-lg font-extrabold text-foreground">Financeiro e operação</h2>
        <p className="text-xs text-muted-foreground">Os cartões de faturamento somam atendimentos concluídos e produtos do PDV. Serviços registrados no PDV ficam fora dessa soma para evitar duplicidade.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {data.revenueCards.map((metric) => <Metric key={metric.label} label={metric.label} value={money(metric.current)} detail={metric.comparison} icon={DollarSign} trend={percent(metric.current, metric.previous)} />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {operationalMetrics.map((metric) => <Metric key={metric.label} {...metric} />)}
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Meta de faturamento do mês</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-bold text-foreground">{money(data.monthRevenue)} realizados</span>
              <span className="text-muted-foreground">Meta: {data.monthGoal > 0 ? money(data.monthGoal) : 'não definida'}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progresso da meta mensal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.monthGoal > 0 ? Math.min(100, Math.round((data.monthRevenue / data.monthGoal) * 100)) : 0}>
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data.monthGoal > 0 ? Math.min(100, (data.monthRevenue / data.monthGoal) * 100) : 0}%` }} />
            </div>
            {data.monthGoal > 0 && <p className="mt-1 text-xs text-muted-foreground">{Math.round((data.monthRevenue / data.monthGoal) * 100)}% da meta alcançada</p>}
          </div>
          <div className="flex gap-2">
            <Input aria-label="Meta de faturamento mensal em reais" inputMode="decimal" placeholder="Ex.: 5.000,00" value={goalInput} onChange={(event) => { setGoalInput(event.target.value); setGoalError(null); saveGoal.reset(); }} className="w-36" />
            <Button type="button" onClick={handleSaveGoal} disabled={saveGoal.isPending}>{saveGoal.isPending ? 'Salvando…' : 'Salvar meta'}</Button>
          </div>
          {(goalError || saveGoal.error) && <p role="alert" className="text-xs text-destructive sm:col-span-2">{goalError || 'Não foi possível salvar a meta. Tente novamente.'}</p>}
          {saveGoal.isSuccess && !goalError && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-400 sm:col-span-2">Meta mensal salva.</p>}
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        {[
          { title: 'Receita por serviço', rows: data.serviceRanking, emptyMessage: 'Ainda sem atendimentos concluídos no período.' },
          { title: 'Receita por profissional', rows: data.professionalRanking, emptyMessage: 'Ainda sem atendimentos concluídos no período.' },
          { title: 'Receita por produto', rows: data.productRanking, emptyMessage: 'Ainda sem produtos vendidos no período.' },
        ].map((chart) => (
          <Card key={chart.title}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{chart.title}</CardTitle></CardHeader>
            <CardContent className="h-[230px]">
              {chart.rows.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chart.rows} layout="vertical" margin={{ left: 8, right: 18 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tickFormatter={(value) => money(Number(value))} /><YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11 }} /><Tooltip {...currencyTooltip} /><Bar dataKey="revenue" name="Receita" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{chart.emptyMessage}</div>}
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Horários mais procurados</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.peakHours.length ? data.peakHours.slice(0, 6).map((item) => {
              const max = Math.max(...data.peakHours.map((entry) => entry.count), 1);
              return <div key={item.hour} className="grid grid-cols-[42px_1fr_30px] items-center gap-2 text-xs"><span className="font-bold text-foreground">{item.hour}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} /></div><span className="text-right text-muted-foreground">{item.count}</span></div>;
            }) : <p className="py-8 text-center text-sm text-muted-foreground">Sem horários ocupados no período.</p>}
            <p className="border-t pt-3 text-[11px] text-muted-foreground">Agendamentos do período selecionado.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Mapa de calor por dia e hora</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {data.bookingHeatmap.hours.length ? (
              <table className="w-full min-w-[460px] border-separate border-spacing-1 text-xs" aria-label="Agendamentos por dia da semana e hora">
                <thead>
                  <tr>
                    <th scope="col" className="px-2 py-1 text-left font-semibold text-muted-foreground">Dia</th>
                    {data.bookingHeatmap.hours.map((hour) => <th key={hour} scope="col" className="px-1 py-1 text-center font-semibold text-muted-foreground">{String(hour).padStart(2, '0')}h</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.bookingHeatmap.rows.map((row) => (
                    <tr key={row.weekday}>
                      <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-foreground">{row.label}</th>
                      {row.counts.map((count, index) => {
                        const hour = data.bookingHeatmap.hours[index];
                        const intensity = count && data.bookingHeatmap.maxCount ? 0.2 + (count / data.bookingHeatmap.maxCount) * 0.8 : 1;
                        const heatClass = !count
                          ? 'bg-muted text-muted-foreground'
                          : intensity < 0.5
                            ? 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-100'
                            : intensity < 0.85
                              ? 'bg-blue-300 text-blue-950 dark:bg-blue-700 dark:text-white'
                              : 'bg-blue-600 text-white dark:bg-blue-500';
                        return (
                          <td key={`${row.weekday}-${hour}`} className="p-0.5 text-center" aria-label={`${row.label}, ${String(hour).padStart(2, '0')}h: ${count} agendamentos`}>
                            <span className={`grid h-7 min-w-8 place-items-center rounded-md font-semibold ${heatClass}`}>
                              {count || '·'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="py-8 text-center text-sm text-muted-foreground">Sem agendamentos no período selecionado.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Origem dos agendamentos</CardTitle></CardHeader>
          <CardContent className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bookingOrigins} layout="vertical" margin={{ left: 8, right: 18 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [Number(value), 'Agendamentos']} />
                <Bar dataKey="count" name="Agendamentos" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BusinessPulse;
