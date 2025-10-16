import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import Layout from '@/components/Layout';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    monthlyRevenue: 0,
    totalAppointments: 0,
    newClients: 0,
    topServices: [],
    clientRetention: 0
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        // Mock data for now
        setReportData({
          monthlyRevenue: 15000,
          totalAppointments: 245,
          newClients: 32,
          topServices: [
            { name: 'Corte + Barba', count: 89 },
            { name: 'Corte Simples', count: 76 },
            { name: 'Barba', count: 45 }
          ],
          clientRetention: 87
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const stats = [
    {
      title: "Receita Mensal",
      value: `R$ ${reportData.monthlyRevenue.toLocaleString('pt-BR')}`,
      change: "+12% vs mês anterior",
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Total de Agendamentos",
      value: reportData.totalAppointments.toString(),
      change: "+8% vs mês anterior",
      icon: Calendar,
      color: "blue"
    },
    {
      title: "Novos Clientes",
      value: reportData.newClients.toString(),
      change: "+15% vs mês anterior",
      icon: Users,
      color: "purple"
    },
    {
      title: "Taxa de Retenção",
      value: `${reportData.clientRetention}%`,
      change: "+3% vs mês anterior",
      icon: TrendingUp,
      color: "orange"
    }
  ];

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
            <Card>
              <CardHeader>
                <CardTitle>Serviços Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{service.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{service.count} agendamentos</span>
                        <Progress value={(service.count / reportData.totalAppointments) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Análise detalhada dos serviços...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Análise detalhada dos clientes...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;