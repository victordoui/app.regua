import React from "react";
import { Calendar, DollarSign, Users, Target } from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { motion } from "framer-motion";
import RevenueChart from "@/components/charts/RevenueChart";
import ServicesChart from "@/components/charts/ServicesChart";
import OccupancyChart from "@/components/charts/OccupancyChart";
import RecentActivities from "@/components/dashboard/RecentActivities";
import BirthdayClients from "@/components/dashboard/BirthdayClients";
import InactiveClients from "@/components/dashboard/InactiveClients";
import ProfileCard from "@/components/dashboard/ProfileCard";
import StatMiniCard from "@/components/dashboard/StatMiniCard";
import TodayScheduleCard from "@/components/dashboard/TodayScheduleCard";
import CTACard from "@/components/dashboard/CTACard";

const DashboardOverview = () => {
  const { metrics, monthlyRevenue, isLoading } = useRealtimeDashboard();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPI Cards — 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <StatMiniCard
            label="Agendamentos Hoje"
            value={metrics.todayAppointments.toString()}
            icon={Calendar}
            subtitle={`${metrics.monthAppointments} este mês`}
            trend={{ value: "+12%", positive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatMiniCard
            label="Receita Mensal"
            value={`R$ ${metrics.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
            icon={DollarSign}
            trend={{ value: "+8%", positive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatMiniCard
            label="Clientes Totais"
            value={metrics.totalClients.toString()}
            icon={Users}
            subtitle={`${metrics.newClientsThisMonth} novos`}
            trend={{ value: `+${metrics.newClientsThisMonth}`, positive: metrics.newClientsThisMonth > 0 }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatMiniCard
            label="Taxa de Ocupação"
            value={`${metrics.occupancyRate}%`}
            icon={Target}
            subtitle={`${metrics.completedRate}% conclusão`}
            trend={{ value: `${metrics.occupancyRate}%`, positive: metrics.occupancyRate > 60 }}
          />
        </motion.div>
      </div>

      {/* Charts — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <RevenueChart data={monthlyRevenue} />
        </motion.div>
        <motion.div variants={item}>
          <ServicesChart />
        </motion.div>
      </div>

      {/* Occupancy full width */}
      <motion.div variants={item}>
        <OccupancyChart />
      </motion.div>

      {/* Bottom — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <TodayScheduleCard />
        </motion.div>
        <motion.div variants={item}>
          <RecentActivities />
        </motion.div>
        <motion.div variants={item} className="space-y-6">
          <ProfileCard />
          <CTACard />
        </motion.div>
      </div>

      {/* Base */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BirthdayClients />
        <InactiveClients />
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
