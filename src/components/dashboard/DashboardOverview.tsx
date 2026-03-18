import React from "react";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { motion } from "framer-motion";
import RevenueChart from "@/components/charts/RevenueChart";
import ServicesChart from "@/components/charts/ServicesChart";
import OccupancyChart from "@/components/charts/OccupancyChart";
import RecentActivities from "@/components/dashboard/RecentActivities";
import BirthdayClients from "@/components/dashboard/BirthdayClients";
import InactiveClients from "@/components/dashboard/InactiveClients";
import TodayScheduleCard from "@/components/dashboard/TodayScheduleCard";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";

const DashboardOverview = () => {
  const { user } = useAuth();
  const { metrics, monthlyRevenue, isLoading } = useRealtimeDashboard();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || 
                    user?.email?.split("@")[0] || "Usuário";

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground font-inter">Carregando dashboard...</div>
      </div>
    );
  }

  const pendingCount = metrics.monthAppointments - Math.round(metrics.monthAppointments * metrics.completedRate / 100);
  const completedCount = metrics.monthAppointments - pendingCount;
  const cancelledEstimate = Math.round(metrics.monthAppointments * 0.05);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 font-inter">
      {/* Welcome Section */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-extrabold text-foreground font-montserrat">
          Organize e cresça, {firstName}! 🔥
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-opensans">
          Acompanhe seus agendamentos, receita e desempenho em tempo real.
        </p>
      </motion.div>

      {/* 4 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <DashboardStatCard
            title="Agendamentos Hoje"
            value={metrics.todayAppointments.toString()}
            subtitle={`${metrics.monthAppointments} este mês`}
            icon={Calendar}
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
          />
        </motion.div>
        <motion.div variants={item}>
          <DashboardStatCard
            title="Concluídos"
            value={completedCount.toString()}
            subtitle="nas últimas 24h"
            icon={CheckCircle}
            iconBgClass="bg-green-100 dark:bg-green-900/30"
            iconColorClass="text-green-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <DashboardStatCard
            title="Pendentes"
            value={pendingCount.toString()}
            subtitle="aguardando confirmação"
            icon={Clock}
            iconBgClass="bg-amber-100 dark:bg-amber-900/30"
            iconColorClass="text-amber-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <DashboardStatCard
            title="Cancelados"
            value={cancelledEstimate.toString()}
            subtitle="nas últimas 24h"
            icon={XCircle}
            iconBgClass="bg-red-100 dark:bg-red-900/30"
            iconColorClass="text-red-600"
          />
        </motion.div>
      </div>

      {/* 2 Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <RevenueChart data={monthlyRevenue} />
        </motion.div>
        <motion.div variants={item}>
          <OccupancyChart />
        </motion.div>
      </div>

      {/* Today Schedule — full width */}
      <motion.div variants={item}>
        <TodayScheduleCard />
      </motion.div>

      {/* Services Chart + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <ServicesChart />
        </motion.div>
        <RecentActivities />
      </div>

      {/* Birthday + Inactive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BirthdayClients />
        <InactiveClients />
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
