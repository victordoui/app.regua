import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.2)'];

interface ReportData {
  monthlyRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  newClients: number;
  clientRetention: number;
  topServices: { name: string; count: number }[];
}

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { salesData, serviceSales, summary, isLoading: isLoadingSales, dateRange, setDateRange } = useSalesReports();

  const fetchReportData = async (): Promise<ReportData> => {
    if (!user) return { monthlyRevenue: 0, totalAppointments: 0, completedAppointments: 0, newClients: 0, clientRetention: 0, topServices: [] };

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    const { data: appointmentsData, error: aptError } = await supabase
      .from("appointments")
      .select(`id, status, total_price, created_at, services (name)`)
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    if (aptError) throw aptError;

    const completedAppointments = (appointmentsData || []).filter(a => a.status === 'completed');
    const totalAppointments = (appointmentsData || []).length;
    const monthlyRevenue = completedAppointments.reduce((sum, a) => sum + (a.total_price || 0), 0);

    const serviceCounts: { [key: string]: number } = {};
    completedAppointments.forEach((apt: any) => {
      const serviceName = apt.services?.name || 'Serviço Desconhecido';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const { data: clientsData, error: clientsError } = await supabase
      .from("profiles")
      .select("id, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    if (clientsError) throw clientsError;

    return {
      monthlyRevenue,
      totalAppointments,
      completedAppointments: completedAppointments.length,
      newClients: (clientsData || []).length,
      clientRetention: 85,
      topServices,
    };
  };

  const { data: reportData, isLoading } = useQuery<ReportData, Error>({
    queryKey: ["reports", user?.id],
    queryFn: fetchReportData,
    enabled: !!user,
    initialData: { monthlyRevenue: 0, totalAppointments: 0, completedAppointments: 0, newClients: 0, clientRetention: 0, topServices: [] }
  });

  const stats = [
    { title: "Receita Mensal", value: `R$ ${reportData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: "Dados em tempo real", icon: DollarSign },
    { title: "Total de Agendamentos", value: reportData.totalAppointments.toString(), change: `${reportData.completedAppointments} concluídos`, icon: Calendar },
    { title: "Novos Clientes", value: reportData.newClients.toString(), change: "Este mês", icon: Users },
    { title: "Taxa de Retenção", value: `${reportData.clientRetention}%`, change: "Estimativa", icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Carregando relatórios...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">Visualize os dados e métricas da sua barbearia</p>
          </div>
          <Button><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <RevenueChart />
              <OccupancyChart />
            </div>
            <Card>
              <CardHeader><CardTitle>Serviços Mais Populares (Mês Atual)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topServices.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum serviço concluído este mês.</p>
                  ) : (
                    reportData.topServices.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{service.count} agendamentos</span>
                          <Progress value={(service.count / reportData.completedAppointments) * 100} className="w-20" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div className="flex justify-end">
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeType)}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-500" /><span className="text-sm text-muted-foreground">Receita Total</span></div>
                  <p className="text-3xl font-bold mt-2">R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <Badge variant={summary.revenueGrowth >= 0 ? 'default' : 'destructive'} className="mt-2">
                    {summary.revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {summary.revenueGrowth.toFixed(1)}% vs anterior
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-blue-500" /><span className="text-sm text-muted-foreground">Atendimentos</span></div>
                  <p className="text-3xl font-bold mt-2">{summary.totalAppointments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-500" /><span className="text-sm text-muted-foreground">Ticket Médio</span></div>
                  <p className="text-3xl font-bold mt-2">R$ {summary.ticketMedio.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Período Anterior</span></div>
                  <p className="text-3xl font-bold mt-2">R$ {summary.prevTotalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
            </div>
            <SalesChart data={salesData} />
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Serviços Mais Vendidos</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={serviceSales.slice(0, 5)} cx="50%" cy="50%" outerRadius={80} dataKey="revenue" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {serviceSales.slice(0, 5).map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Ranking de Serviços</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {serviceSales.slice(0, 5).map((service, i) => (
                      <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">{i + 1}º</span>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.count} atendimentos</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">R$ {service.revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <ServicesChart />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Métricas de Clientes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Novos clientes (mês)</span>
                    <span className="font-bold text-lg">{reportData.newClients}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Taxa de retenção</span>
                    <span className="font-bold text-lg">{reportData.clientRetention}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Agendamentos concluídos</span>
                    <span className="font-bold text-lg">{reportData.completedAppointments}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Ticket Médio</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">
                    R$ {reportData.completedAppointments > 0
                      ? (reportData.monthlyRevenue / reportData.completedAppointments).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0,00'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Valor médio por atendimento</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
