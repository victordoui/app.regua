import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, BarChart3, Download, Calendar, DollarSign, Users, ShoppingCart } from 'lucide-react';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import RevenueChart from '@/components/charts/RevenueChart';
import ServicesChart from '@/components/charts/ServicesChart';
import OccupancyChart from '@/components/charts/OccupancyChart';
import SalesChart from '@/components/reports/SalesChart';
import { useSalesReports, DateRangeType } from '@/hooks/useSalesReports';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PageContainer, PageHeader } from '@/components/ui/page-header';
import { StatusCards } from '@/components/ui/status-cards';
import { SectionTabsLayout } from '@/components/ui/section-tabs';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.2)'];
const reportSections = [
  { value: 'overview', label: 'Visão Geral', description: 'Resumo do negócio', icon: BarChart3 },
  { value: 'sales', label: 'Vendas', description: 'Receita e atendimentos', icon: DollarSign },
  { value: 'services', label: 'Serviços', description: 'Desempenho dos serviços', icon: ShoppingCart },
  { value: 'clients', label: 'Clientes', description: 'Retenção e novos clientes', icon: Users },
] as const;

interface ReportData { monthlyRevenue: number; totalAppointments: number; completedAppointments: number; newClients: number; clientRetention: number; topServices: { name: string; count: number }[]; }

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { salesData, serviceSales, summary, isLoading: isLoadingSales, dateRange, setDateRange } = useSalesReports();

  const fetchReportData = async (): Promise<ReportData> => {
    if (!user) return { monthlyRevenue: 0, totalAppointments: 0, completedAppointments: 0, newClients: 0, clientRetention: 0, topServices: [] };
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
    const { data: appointmentsData, error: aptError } = await supabase.from("appointments").select(`id, status, total_price, created_at, services (name)`).eq("user_id", user.id).gte("created_at", startOfMonth).lte("created_at", endOfMonth);
    if (aptError) throw aptError;
    const completed = (appointmentsData || []).filter(a => a.status === 'completed');
    const total = (appointmentsData || []).length;
    const revenue = completed.reduce((sum, a) => sum + (a.total_price || 0), 0);
    const sc: { [k: string]: number } = {};
    completed.forEach((appointment) => { const service = appointment.services as { name?: string } | null; const name = service?.name || 'Desconhecido'; sc[name] = (sc[name] || 0) + 1; });
    const topServices = Object.entries(sc).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    const { data: clientsData } = await supabase.from("profiles").select("id, created_at").eq("user_id", user.id).gte("created_at", startOfMonth).lte("created_at", endOfMonth);
    return { monthlyRevenue: revenue, totalAppointments: total, completedAppointments: completed.length, newClients: (clientsData || []).length, clientRetention: 85, topServices };
  };

  const { data: reportData, isLoading } = useQuery<ReportData, Error>({ queryKey: ["reports", user?.id], queryFn: fetchReportData, enabled: !!user, initialData: { monthlyRevenue: 0, totalAppointments: 0, completedAppointments: 0, newClients: 0, clientRetention: 0, topServices: [] } });

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-[400px] text-muted-foreground">Carregando relatórios...</div></Layout>;

  return (
    <Layout>
      <PageContainer>
        <PageHeader eyebrow="Financeiro" icon={<BarChart3 className="h-5 w-5" />} title="Insights" subtitle="Entenda os resultados do negócio sem precisar interpretar relatórios complicados.">
          <Button><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </PageHeader>

        <StatusCards
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          items={[
            { label: "Receita Mensal", value: `R$ ${reportData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign className="h-5 w-5" />, color: "green" },
            { label: "Agendamentos", value: reportData.totalAppointments, icon: <Calendar className="h-5 w-5" />, color: "blue", suffix: `(${reportData.completedAppointments} concluídos)` },
            { label: "Novos Clientes", value: reportData.newClients, icon: <Users className="h-5 w-5" />, color: "purple" },
            { label: "Retenção", value: `${reportData.clientRetention}%`, icon: <TrendingUp className="h-5 w-5" />, color: "amber" },
          ]}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <SectionTabsLayout items={reportSections} navigationTitle="O que você quer analisar?">
          <TabsContent value="overview" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2"><RevenueChart /><OccupancyChart /></div>
            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Serviços Mais Populares</h3></div>
              <div className="p-5 space-y-4">
                {reportData.topServices.length === 0 ? <p className="text-muted-foreground">Nenhum serviço concluído este mês.</p>
                : reportData.topServices.map((s, i) => <div key={i} className="flex items-center justify-between"><span className="font-medium">{s.name}</span><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">{s.count} agendamentos</span><Progress value={(s.count / reportData.completedAppointments) * 100} className="w-20" /></div></div>)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="mt-0 space-y-4">
            <div className="flex justify-end"><Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeType)}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="today">Hoje</SelectItem><SelectItem value="week">Semana</SelectItem><SelectItem value="month">Mês</SelectItem><SelectItem value="year">Ano</SelectItem></SelectContent></Select></div>
            <StatusCards
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              items={[
                { label: "Receita Total", value: `R$ ${summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign className="h-5 w-5" />, color: "green" },
                { label: "Atendimentos", value: summary.totalAppointments, icon: <ShoppingCart className="h-5 w-5" />, color: "blue" },
                { label: "Ticket Médio", value: `R$ ${summary.ticketMedio.toFixed(2)}`, icon: <BarChart3 className="h-5 w-5" />, color: "purple" },
                { label: "Período Anterior", value: `R$ ${summary.prevTotalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign className="h-5 w-5" />, color: "amber" },
              ]}
            />
            <SalesChart data={salesData} />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border/40 bg-card shadow-sm">
                <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Serviços Mais Vendidos</h3></div>
                <div className="p-5 h-[250px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={serviceSales.slice(0, 5)} cx="50%" cy="50%" outerRadius={80} dataKey="revenue" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>{serviceSales.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} /></PieChart></ResponsiveContainer></div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card shadow-sm">
                <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Ranking de Serviços</h3></div>
                <div className="p-5 space-y-3">{serviceSales.slice(0, 5).map((s, i) => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div className="flex items-center gap-3"><span className="font-bold text-primary">{i + 1}º</span><div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.count} atendimentos</p></div></div><span className="font-bold text-green-600 dark:text-green-400">R$ {s.revenue.toFixed(2)}</span></div>)}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-0"><ServicesChart /></TabsContent>

          <TabsContent value="clients" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
                <h3 className="font-semibold mb-4">Métricas de Clientes</h3>
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Novos (mês)</span><span className="font-bold text-lg">{reportData.newClients}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Retenção</span><span className="font-bold text-lg">{reportData.clientRetention}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Concluídos</span><span className="font-bold text-lg">{reportData.completedAppointments}</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
                <h3 className="font-semibold mb-4">Ticket Médio</h3>
                <div className="text-4xl font-bold text-primary">R$ {reportData.completedAppointments > 0 ? (reportData.monthlyRevenue / reportData.completedAppointments).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</div>
                <p className="text-sm text-muted-foreground mt-2">Valor médio por atendimento</p>
              </div>
            </div>
          </TabsContent>
          </SectionTabsLayout>
        </Tabs>
      </PageContainer>
    </Layout>
  );
};

export default Reports;
