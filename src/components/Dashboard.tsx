import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Crown, Calendar, DollarSign, Target, Heart, Users } from "lucide-react";
import Layout from "@/components/Layout";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  status: string;
}

interface Appointment {
  id: string;
  total_price: number;
  services: Service;
  status: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    appointments: { total: 0, completed: 0, cancelled: 0, completedInMonth: 0 },
    revenue: { today: 0, month: 0, growth: 0 },
    clients: { total: 0, new: 0 },
    performance: { occupancy: 0, satisfaction: 0 },
    subscriptions: { activeCount: 0, mrr: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const appointments: Appointment[] = [
          { id: "1", total_price: 50, services: { id: "1", duration_minutes: 30, status: "completed", name: "Corte Simples", description: "Corte de cabelo padrão", price: 50 }, status: "completed" },
          { id: "2", total_price: 35, services: { id: "2", duration_minutes: 45, status: "completed", name: "Barba", description: "Barba padrão", price: 30 }, status: "completed" },
          { id: "3", total_price: 80, services: { id: "3", duration_minutes: 60, status: "completed", name: "Corte + Barba", description: "Combo", price: 80 }, status: "completed" },
          { id: "4", total_price: 25, services: { id: "4", duration_minutes: 20, status: "cancelled", name: "Sobrancelha", description: "Cancelado", price: 25 }, status: "cancelled" },
        ];

        const completedAppointments = appointments.filter(apt => apt.status === "completed");
        const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.total_price || 0), 0);
        const totalClients = 150;
        const newClients = 18;
        const activeCount = 3;
        const mrr = 750;
        const satisfaction = 92;
        const retention = activeCount > 0 ? Math.round((activeCount / (activeCount + 1)) * 100) : 0;

        setDashboardData({
          appointments: {
            total: appointments.length,
            completed: completedAppointments.length,
            cancelled: appointments.filter(apt => apt.status === "cancelled").length,
            completedInMonth: completedAppointments.length
          },
          revenue: { today: totalRevenue / 30, month: totalRevenue, growth: 12 },
          clients: { total: totalClients, new: newClients },
          performance: {
            occupancy: appointments.length > 0 ? Math.min((completedAppointments.length / appointments.length) * 100, 100) : 0,
            satisfaction
          },
          subscriptions: { activeCount, mrr }
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Assinantes Ativos",
      value: dashboardData.subscriptions.activeCount.toString(),
      change: `MRR: R$ ${dashboardData.subscriptions.mrr.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
      icon: Crown,
      color: "purple",
      progress: dashboardData.performance.occupancy
    },
    {
      title: "Agendamentos",
      value: dashboardData.appointments.total.toString(),
      change: `${dashboardData.appointments.completedInMonth} concluídos`,
      trend: dashboardData.appointments.total > dashboardData.appointments.cancelled ? "up" : "warning",
      icon: Calendar,
      color: "blue",
      progress: dashboardData.appointments.total > 0 ? (dashboardData.appointments.completedInMonth / dashboardData.appointments.total) * 100 : 0
    },
    {
      title: "Receita Mensal",
      value: `R$ ${dashboardData.revenue.month.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `+${dashboardData.revenue.growth}% vs mês anterior`,
      trend: dashboardData.revenue.growth > 0 ? "up" : "down",
      icon: DollarSign,
      color: "green",
      progress: Math.min((dashboardData.revenue.month / 20000) * 100, 100)
    },
    {
      title: "Taxa de Ocupação",
      value: loading ? "..." : `${dashboardData.performance.occupancy.toFixed(1)}%`,
      change: `Eficiência: 88%`,
      trend: dashboardData.performance.occupancy > 80 ? "up" : dashboardData.performance.occupancy > 60 ? "warning" : "down",
      icon: Target,
      color: "orange",
      progress: dashboardData.performance.occupancy
    },
    {
      title: "Satisfação do Cliente",
      value: loading ? "..." : `${dashboardData.performance.satisfaction.toFixed(1)}⭐`,
      change: `${Math.floor(dashboardData.clients.total * 0.15)} clientes VIP`,
      trend: dashboardData.performance.satisfaction > 90 ? "up" : "warning",
      icon: Heart,
      color: "pink",
      progress: dashboardData.performance.satisfaction
    },
    {
      title: "Novos Clientes",
      value: dashboardData.clients.new.toString(),
      change: `Total: ${dashboardData.clients.total} clientes`,
      trend: dashboardData.clients.new > 0 ? "up" : "neutral",
      icon: Users,
      color: "indigo",
      progress: dashboardData.clients.total > 0 ? (dashboardData.clients.new / dashboardData.clients.total) * 100 : 0
    }
  ];

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`p-3 rounded-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'warning' ? 'text-orange-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 
                        'text-muted-foreground'
                      }`}>
                        {stat.change}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {stat.progress?.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={stat.progress || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;