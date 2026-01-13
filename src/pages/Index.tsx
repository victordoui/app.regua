import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Crown, Calendar, DollarSign, Target, Heart, Users, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { motion } from "framer-motion";
import AppointmentsChart from "@/components/charts/AppointmentsChart";
import RevenueChart from "@/components/charts/RevenueChart";
import ServicesChart from "@/components/charts/ServicesChart";
import OccupancyChart from "@/components/charts/OccupancyChart";
import RecentActivities from "@/components/dashboard/RecentActivities";
import BirthdayClients from "@/components/dashboard/BirthdayClients";
import InactiveClients from "@/components/dashboard/InactiveClients";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getStats: getSubscriptionStats } = useSubscriptions();
  const subscriptionStats = getSubscriptionStats();
  
  // Realtime dashboard data
  const { 
    metrics, 
    monthlyRevenue, 
    weeklyAppointments, 
    isLoading, 
    isConnected 
  } = useRealtimeDashboard();

  const stats = React.useMemo(() => [
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
      value: metrics.monthAppointments.toString(),
      change: `Hoje: ${metrics.todayAppointments} agendamentos`,
      trend: metrics.completedRate > 50 ? "up" : "warning",
      icon: Calendar,
      color: "blue",
      progress: metrics.completedRate
    },
    {
      title: "Receita Mensal",
      value: `R$ ${metrics.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `Meta: R$ 20.000,00`,
      trend: metrics.monthRevenue > 0 ? "up" : "down",
      icon: DollarSign,
      color: "green",
      progress: Math.min((metrics.monthRevenue / 20000) * 100, 100)
    },
    {
      title: "Taxa de Ocupação",
      value: isLoading ? "..." : `${metrics.occupancyRate.toFixed(1)}%`,
      change: `Baseado em ${metrics.monthAppointments} agendamentos`,
      trend: metrics.occupancyRate > 80 ? "up" : metrics.occupancyRate > 60 ? "warning" : "down",
      icon: Target,
      color: "orange",
      progress: metrics.occupancyRate
    },
    {
      title: "Taxa de Conclusão",
      value: isLoading ? "..." : `${metrics.completedRate}%`,
      change: `${metrics.totalClients} clientes cadastrados`,
      trend: metrics.completedRate > 80 ? "up" : "warning",
      icon: Heart,
      color: "pink",
      progress: metrics.completedRate
    },
    {
      title: "Novos Clientes",
      value: metrics.newClientsThisMonth.toString(),
      change: `Total: ${metrics.totalClients} clientes`,
      trend: metrics.newClientsThisMonth > 0 ? "up" : "neutral",
      icon: Users,
      color: "indigo",
      progress: metrics.totalClients > 0 ? (metrics.newClientsThisMonth / metrics.totalClients) * 100 : 0
    }
  ], [metrics, isLoading, subscriptionStats]);

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
      transition: { staggerChildren: 0.1 }
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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Visão geral do sistema
              </p>
            </div>
            {/* Live indicator */}
            {isConnected && (
              <Badge className="bg-green-500 text-white animate-pulse flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Ao Vivo
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/appointments')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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

        {/* Charts Section with Real Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppointmentsChart data={weeklyAppointments} />
          <RevenueChart data={monthlyRevenue} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServicesChart />
          <OccupancyChart />
        </div>

        {/* Recent Activities + Operational Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivities />
          <BirthdayClients />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <InactiveClients />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
