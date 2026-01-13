import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Crown, Calendar, DollarSign, Target, Heart, Users, Clock, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import RecentActivities from "@/components/dashboard/RecentActivities";
import BirthdayClients from "@/components/dashboard/BirthdayClients";
import InactiveClients from "@/components/dashboard/InactiveClients";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Realtime hooks
  const { 
    todayAppointments, 
    isLoading: appointmentsLoading, 
    isConnected: appointmentsConnected,
    stats: appointmentStats 
  } = useRealtimeAppointments();
  
  const { 
    metrics, 
    isLoading: metricsLoading, 
    isConnected: metricsConnected 
  } = useRealtimeDashboard();

  const isConnected = appointmentsConnected || metricsConnected;
  const loading = appointmentsLoading || metricsLoading;

  const stats = [
    {
      title: "Assinantes Ativos",
      value: metrics.activeSubscriptions.toString(),
      change: `Novos este mês: ${metrics.newClientsThisMonth}`,
      icon: Crown,
      color: "purple",
      progress: Math.min(metrics.activeSubscriptions * 10, 100)
    },
    {
      title: "Agendamentos do Mês",
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
      value: loading ? "..." : `${metrics.occupancyRate}%`,
      change: `${appointmentStats.pending} pendentes`,
      trend: metrics.occupancyRate > 80 ? "up" : metrics.occupancyRate > 60 ? "warning" : "down",
      icon: Target,
      color: "orange",
      progress: metrics.occupancyRate
    },
    {
      title: "Taxa de Conclusão",
      value: loading ? "..." : `${metrics.completedRate}%`,
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
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Concluído</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

        {/* Stats Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                        <div className={`p-3 rounded-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 shadow-md`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
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
              </motion.div>
            );
          })}
        </motion.div>

        {/* Today's Appointments + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agendamentos de Hoje ({todayAppointments.length})
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
                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {todayAppointments.slice(0, 5).map((apt, index) => (
                      <motion.div 
                        key={apt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-semibold text-primary">
                            {apt.appointment_time.slice(0, 5)}
                          </div>
                          <div>
                            <p className="font-medium">{apt.clients?.name || 'Cliente'}</p>
                            <p className="text-sm text-muted-foreground">{apt.services?.name || 'Serviço'}</p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>

          <RecentActivities />
        </div>

        {/* Operational Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BirthdayClients />
          <InactiveClients />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
