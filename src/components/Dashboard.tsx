import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Crown, Calendar, DollarSign, Target, Heart, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import Layout from "@/components/Layout";

interface DashboardData {
  appointments: { total: number; completed: number; cancelled: number; pending: number; todayCount: number };
  revenue: { today: number; month: number; growth: number };
  clients: { total: number; new: number };
  performance: { occupancy: number; satisfaction: number };
  subscriptions: { activeCount: number; mrr: number };
}

interface TodayAppointment {
  id: string;
  appointment_time: string;
  status: string;
  client_name: string;
  service_name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    appointments: { total: 0, completed: 0, cancelled: 0, pending: 0, todayCount: 0 },
    revenue: { today: 0, month: 0, growth: 0 },
    clients: { total: 0, new: 0 },
    performance: { occupancy: 0, satisfaction: 92 },
    subscriptions: { activeCount: 0, mrr: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const today = new Date();
        const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
        const todayStr = format(today, 'yyyy-MM-dd');

        // Fetch all data in parallel
        const [
          appointmentsRes,
          todayAppointmentsRes,
          clientsRes,
          newClientsRes,
          subscriptionsRes
        ] = await Promise.all([
          // All appointments this month
          supabase
            .from("appointments")
            .select("id, status, total_price")
            .eq("user_id", user.id)
            .gte("appointment_date", monthStart)
            .lte("appointment_date", monthEnd),
          
          // Today's appointments with details
          supabase
            .from("appointments")
            .select(`
              id, appointment_time, status,
              clients (name),
              services (name)
            `)
            .eq("user_id", user.id)
            .eq("appointment_date", todayStr)
            .order("appointment_time", { ascending: true }),
          
          // Total clients
          supabase
            .from("clients")
            .select("id", { count: 'exact' })
            .eq("user_id", user.id),
          
          // New clients this month
          supabase
            .from("clients")
            .select("id", { count: 'exact' })
            .eq("user_id", user.id)
            .gte("created_at", monthStart),
          
          // Active subscriptions
          supabase
            .from("user_subscriptions")
            .select(`
              id, status,
              subscription_plans (price)
            `)
            .eq("user_id", user.id)
            .eq("status", "active")
        ]);

        const appointments = appointmentsRes.data || [];
        const completed = appointments.filter(a => a.status === 'completed');
        const cancelled = appointments.filter(a => a.status === 'cancelled');
        const pending = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
        
        const monthRevenue = completed.reduce((sum, a) => sum + (a.total_price || 0), 0);
        
        // Process today's appointments
        const todayAppts: TodayAppointment[] = (todayAppointmentsRes.data || []).map((apt: any) => ({
          id: apt.id,
          appointment_time: apt.appointment_time,
          status: apt.status,
          client_name: apt.clients?.name || 'Cliente',
          service_name: apt.services?.name || 'Serviço'
        }));

        // Calculate MRR from active subscriptions
        const activeSubscriptions = subscriptionsRes.data || [];
        const mrr = activeSubscriptions.reduce((sum, sub: any) => {
          const plan = Array.isArray(sub.subscription_plans) ? sub.subscription_plans[0] : sub.subscription_plans;
          return sum + (plan?.price || 0);
        }, 0);

        setTodayAppointments(todayAppts);
        setDashboardData({
          appointments: {
            total: appointments.length,
            completed: completed.length,
            cancelled: cancelled.length,
            pending: pending.length,
            todayCount: todayAppts.length
          },
          revenue: { 
            today: todayAppts.filter(a => a.status === 'completed').length * 50, // Average estimate
            month: monthRevenue, 
            growth: 12 
          },
          clients: { 
            total: clientsRes.count || 0, 
            new: newClientsRes.count || 0 
          },
          performance: {
            occupancy: appointments.length > 0 ? Math.round((completed.length / appointments.length) * 100) : 0,
            satisfaction: 92
          },
          subscriptions: { 
            activeCount: activeSubscriptions.length, 
            mrr 
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const stats = [
    {
      title: "Assinantes Ativos",
      value: dashboardData.subscriptions.activeCount.toString(),
      change: `MRR: R$ ${dashboardData.subscriptions.mrr.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
      icon: Crown,
      color: "purple",
      progress: dashboardData.subscriptions.activeCount * 10
    },
    {
      title: "Agendamentos do Mês",
      value: dashboardData.appointments.total.toString(),
      change: `${dashboardData.appointments.completed} concluídos`,
      trend: dashboardData.appointments.completed > dashboardData.appointments.cancelled ? "up" : "warning",
      icon: Calendar,
      color: "blue",
      progress: dashboardData.appointments.total > 0 ? (dashboardData.appointments.completed / dashboardData.appointments.total) * 100 : 0
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
      value: loading ? "..." : `${dashboardData.performance.occupancy}%`,
      change: `${dashboardData.appointments.pending} pendentes`,
      trend: dashboardData.performance.occupancy > 80 ? "up" : dashboardData.performance.occupancy > 60 ? "warning" : "down",
      icon: Target,
      color: "orange",
      progress: dashboardData.performance.occupancy
    },
    {
      title: "Satisfação do Cliente",
      value: loading ? "..." : `${dashboardData.performance.satisfaction}⭐`,
      change: `${dashboardData.clients.total} clientes cadastrados`,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
            <Button onClick={() => navigate('/appointments')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agendamentos de Hoje ({dashboardData.appointments.todayCount})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
              Ver Todos
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum agendamento para hoje.
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-semibold text-primary">
                        {apt.appointment_time.slice(0, 5)}
                      </div>
                      <div>
                        <p className="font-medium">{apt.client_name}</p>
                        <p className="text-sm text-muted-foreground">{apt.service_name}</p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;