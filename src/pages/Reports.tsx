import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import RevenueChart from '@/components/charts/RevenueChart';
import ServicesChart from '@/components/charts/ServicesChart';
import OccupancyChart from '@/components/charts/OccupancyChart';

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

  const fetchReportData = async (): Promise<ReportData> => {
    if (!user) return {
      monthlyRevenue: 0,
      totalAppointments: 0,
      completedAppointments: 0,
      newClients: 0,
      clientRetention: 0,
      topServices: []
    };

    // 1. Fetch Appointments and Services for the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    const { data: appointmentsData, error: aptError } = await supabase
      .from("appointments")
      .select(`
        id, 
        status, 
        total_price, 
        created_at,
        services (name)
      `)
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    if (aptError) throw aptError;

    const completedAppointments = (appointmentsData || []).filter(a => a.status === 'completed');
    const totalAppointments = (appointmentsData || []).length;
    const monthlyRevenue = completedAppointments.reduce((sum, a) => sum + (a.total_price || 0), 0);

    // Calculate Top Services
    const serviceCounts: { [key: string]: number } = {};
    completedAppointments.forEach((apt: any) => {
      const serviceName = apt.services?.name || 'Serviço Desconhecido';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Fetch Clients (Profiles) created this month
    const { data: clientsData, error: clientsError } = await supabase
      .from("profiles")
      .select("id, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    if (clientsError) throw clientsError;
    const newClients = (clientsData || []).length;

    // Placeholder for retention (requires more complex logic/data)
    const clientRetention = 85; 

    return {
      monthlyRevenue,
      totalAppointments,
      completedAppointments: completedAppointments.length,
      newClients,
      clientRetention,
      topServices,
    };
  };

  const { data: reportData, isLoading } = useQuery<ReportData, Error>({
    queryKey: ["reports", user?.id],
    queryFn: fetchReportData,
    enabled: !!user,
    initialData: {
      monthlyRevenue: 0,
      totalAppointments: 0,
      completedAppointments: 0,
      newClients: 0,
      clientRetention: 0,
      topServices: []
    }
  });

  useEffect(() => {
    if (isLoading && !user) {
      // Do nothing if loading and user is null (unauthenticated)
    } else if (reportData && !isLoading) {
      // Data loaded successfully
    } else if (reportData === undefined) {
      toast({
        title: "Erro de dados",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive",
      });
    }
  }, [reportData, isLoading, user, toast]);


  const stats = [
    {
      title: "Receita Mensal",
      value: `R$ ${reportData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "Dados em tempo real",
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Total de Agendamentos",
      value: reportData.totalAppointments.toString(),
      change: `${reportData.completedAppointments} concluídos`,
      icon: Calendar,
      color: "blue"
    },
    {
      title: "Novos Clientes",
      value: reportData.newClients.toString(),
      change: "Este mês",
      icon: Users,
      color: "purple"
    },
    {
      title: "Taxa de Retenção",
      value: `${reportData.clientRetention}%`,
      change: "Estimativa",
      icon: TrendingUp,
      color: "orange"
    }
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
            <p className="text-muted-foreground">
              Visualize os dados e métricas da sua barbearia
            </p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
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
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <RevenueChart />
              <OccupancyChart />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Serviços Mais Populares (Mês Atual)</CardTitle>
              </CardHeader>
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

          <TabsContent value="services" className="space-y-4">
            <ServicesChart />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Clientes</CardTitle>
                </CardHeader>
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
                <CardHeader>
                  <CardTitle>Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">
                    R$ {reportData.completedAppointments > 0 
                      ? (reportData.monthlyRevenue / reportData.completedAppointments).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0,00'
                    }
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