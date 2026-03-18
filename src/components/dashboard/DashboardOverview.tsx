import React from "react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { HeartHandshake, Users, Star } from "lucide-react";
import HeroSection from "./HeroSection";
import KpiStrip from "./KpiStrip";
import OccupationHeatmap from "./OccupationHeatmap";
import RevenueLineChart from "./RevenueLineChart";
import MiniCalendarPanel from "./MiniCalendarPanel";
import TodayAppointmentsPanel from "./TodayAppointmentsPanel";
import RecentTransactionsPanel from "./RecentTransactionsPanel";
import ProfessionalsPanel from "./ProfessionalsPanel";
import MonthRevenueDonut from "./MonthRevenueDonut";
import CustomerSuccessContent from "./CustomerSuccessContent";
import BarberPerformanceContent from "./BarberPerformanceContent";
import ReviewsContent from "./ReviewsContent";

const DashboardOverview = () => {
  const { metrics, monthlyRevenue, isLoading } = useRealtimeDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-7">
      <HeroSection />

      <KpiStrip
        todayAppointments={metrics.todayAppointments}
        completedRate={metrics.completedRate}
        newClients={metrics.newClientsThisMonth}
        dayRevenue={metrics.monthRevenue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr] gap-6">
        <OccupationHeatmap />
        <RevenueLineChart data={monthlyRevenue} />
        <div className="flex flex-col gap-6">
          <MiniCalendarPanel />
          <TodayAppointmentsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactionsPanel />
        <ProfessionalsPanel />
        <MonthRevenueDonut monthRevenue={metrics.monthRevenue} />
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" /> Sucesso do Cliente
        </h2>
        <CustomerSuccessContent />
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Desempenho dos Profissionais
        </h2>
        <BarberPerformanceContent />
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" /> Avaliações
        </h2>
        <ReviewsContent />
      </div>
    </div>
  );
};

export default DashboardOverview;
