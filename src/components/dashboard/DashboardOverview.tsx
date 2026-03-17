import React from "react";
import { Calendar, Clock, DollarSign, Users, TrendingUp, CheckCircle } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
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
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isConnected && (
            <Badge className="bg-primary text-primary-foreground animate-pulse flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Ao Vivo
            </Badge>
          )}
        </div>
        <Button onClick={() => navigate('/appointments')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Section 1 — Top: Profile + Stats + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <ProfileCard />
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <StatMiniCard
            label="Agendamentos Hoje"
            value={metrics.todayAppointments.toString()}
            icon={Calendar}
            borderColor="border-primary"
            subtitle={`${metrics.monthAppointments} este mês`}
          />
          <StatMiniCard
            label="Taxa de Conclusão"
            value={`${metrics.completedRate}%`}
            icon={CheckCircle}
            borderColor="border-primary/60"
            subtitle={`${metrics.totalClients} clientes cadastrados`}
          />
          <StatMiniCard
            label="Novos Clientes"
            value={metrics.newClientsThisMonth.toString()}
            icon={Users}
            borderColor="border-accent"
            subtitle={`Total: ${metrics.totalClients}`}
          />
        </motion.div>

        <motion.div variants={item}>
          <RevenueChart data={monthlyRevenue} />
        </motion.div>
      </div>

      {/* Section 2 — Occupancy (full width) */}
      <motion.div variants={item}>
        <OccupancyChart />
      </motion.div>

      {/* Section 3 — Bottom: Schedule + Services + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <TodayScheduleCard />
        </motion.div>
        <motion.div variants={item}>
          <ServicesChart />
        </motion.div>
        <motion.div variants={item}>
          <CTACard />
        </motion.div>
      </div>

      {/* Existing sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities />
        <BirthdayClients />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <InactiveClients />
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
