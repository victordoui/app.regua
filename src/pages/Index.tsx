import React, { useMemo, useCallback } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Crown, Calendar, DollarSign, Target, Heart, Users, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { motion } from "framer-motion";

interface DashboardData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  monthlyRevenue: number;
  totalClients: number;
  newClientsMonth: number;
  occupancyRate: number;
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getStats: getSubscriptionStats } = useSubscriptions();
  const subscriptionStats = getSubscriptionStats();

  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    if (!user) return {
      totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0,
      monthlyRevenue: 0, totalClients: 0, newClientsMonth: 0, occupancyRate: 0
    };

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    // 1. Appointments Data (Current Month)
    const { data: appointmentsData, error: aptError } = await supabase
      .from("appointments")
      .select("id, status, total_price")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    if (aptError) throw aptError;

    const totalAppointments = (appointmentsData || []).length;
    const completedAppointments = (appointmentsData || []).filter(a => a.status === 'completed').length;
    const cancelledAppointments = (appointmentsData || []).filter(a => a.status === 'cancelled').length;
    const monthlyRevenue = (appointmentsData || [])
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.total_price || 0), 0);

    const occupancyRate = totalAppointments > 0 ? Math.min((completedAppointments / totalAppointments) * 100, 100) : 0;

    // 2. Clients Data (Total and New this Month)
    const { data: totalClientsData, error: totalClientsError } = await supabase
      .from("profiles")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("role", "cliente");

    if (totalClientsError) throw totalClientsError;
    const totalClients = (totalClientsData || []).length;

    const newClientsMonth = (totalClientsData || []).filter(c => {
      const clientDate = new Date(c.created_at);
      const now = new Date();
      return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      monthlyRevenue,
      totalClients,
      newClientsMonth,
      occupancyRate,
    };
  }, [user]);

  const { data: dashboardData, isLoading } = useQuery<DashboardData, Error>({
    queryKey: ["dashboardData", user?.id],
    queryFn: fetchDashboardData,
    enabled: !!user,
    initialData: {
      totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0,
      monthlyRevenue: 0, totalClients: 0, newClientsMonth: 0, occupancyRate: 0
    }
  });

  const stats = useMemo(() => [
    {
      title: "Assinantes Ativos",
      value: subscriptionStats.activeCount.toString(),
      change: `MRR: R$ ${subscriptionStats.mrr.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
      icon: Crown,
      color: "purple",
      progress: subscriptionStats.retention
    },
    {
      title: "Agendamentos (Mês)",
      value: dashboardData.totalAppointments.toString(),
      change: `${dashboardData.completedAppointments} concluídos`,
      trend: dashboardData.totalAppointments > dashboardData.cancelledAppointments ? "up" : "warning",
      icon: Calendar,
      color: "blue",
      progress: dashboardData.totalAppointments > 0 ? (dashboardData.completedAppointments / dashboardData.totalAppointments) * 100 : 0
    },
    {
      title: "Receita Mensal",
      value: `R$ ${dashboardData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `Meta: R$ 20.000,00`, // Placeholder for growth calculation
      trend: dashboardData.monthlyRevenue > 0 ? "up" : "down",
      icon: DollarSign,
      color: "green",
      progress: Math.min((dashboardData.monthlyRevenue / 20000) * 100, 100)
    },
    {
      title: "Taxa de Ocupação",
      value: isLoading ? "..." : `${dashboardData.occupancyRate.toFixed(1)}%`,
      change: `Baseado em ${dashboardData.totalAppointments} agendamentos`,
      trend: dashboardData.occupancyRate > 80 ? "up" : dashboardData.occupancyRate > 60 ? "warning" : "down",
      icon: Target,
      color: "orange",
      progress: dashboardData.occupancyRate
    },
    {
      title: "Satisfação do Cliente",
      value: "4.7⭐", // Mocked
      change: "Baseado em 156 feedbacks", // Mocked
      trend: "up",
      icon: Heart,
      color: "pink",
      progress: 94 // Mocked
    },
    {
      title: "Novos Clientes",
      value: dashboardData.newClientsMonth.toString(),
      change: `Total: ${dashboardData.totalClients} clientes`,
      trend: dashboardData.newClientsMonth > 0 ? "up" : "neutral",
      icon: Users,
      color: "indigo",
      progress: dashboardData.totalClients > 0 ? (dashboardData.newClientsMonth / dashboardData.totalClients) * 100 : 0
    }
  ], [dashboardData, isLoading, subscriptionStats]);

  const getStatColor = (color: string) => {
    switch (color) {
      case "purple": return "from-purple-500 to-purple-600";
      case "blue": return "from-blue-500 to-blue-600";
      case "green": return "from-green-500 to-green-600";
      case "orange": return "from-orange-500 to-orange-600";
      case "pink": return "from-pink-500 to-pink-600";
      case "indigo": return "from-indigo-500 to-indigo-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Carregando dashboard...</div>
        </div>
      </Layout>
    );
  }

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
            <Button onClick={() => toast({ title: "Funcionalidade em desenvolvimento" })}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={item}>
                <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${getStatColor(stat.color)} shadow-md`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' :
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
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes (Mock)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo agendamento confirmado</p>
                    <p className="text-xs text-muted-foreground">João Silva - Corte + Barba</p>
                  </div>
                  <span className="text-xs text-muted-foreground">há 5 min</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo cliente cadastrado</p>
                    <p className="text-xs text-muted-foreground">Maria Santos</p>
                  </div>
                  <span className="text-xs text-muted-foreground">há 15 min</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assinatura ativada</p>
                    <p className="text-xs text-muted-foreground">Plano Premium - Pedro Costa</p>
                  </div>
                  <span className="text-xs text-muted-foreground">há 1 hora</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Hoje (Mock)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Carlos Silva</p>
                    <p className="text-xs text-muted-foreground">Corte Masculino</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">14:00</p>
                    <p className="text-xs text-green-600">Confirmado</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">João Santos</p>
                    <p className="text-xs text-muted-foreground">Corte + Barba</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">15:30</p>
                    <p className="text-xs text-green-600">Confirmado</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Pedro Oliveira</p>
                    <p className="text-xs text-muted-foreground">Barba</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">17:00</p>
                    <p className="text-xs text-yellow-600">Pendente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;