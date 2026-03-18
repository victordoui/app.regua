import React from "react";
import { useNavigate } from "react-router-dom";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle, Users, DollarSign, Plus, SlidersHorizontal } from "lucide-react";
import HeroSection from "./HeroSection";
import KpiStrip from "./KpiStrip";
import OccupationHeatmap from "./OccupationHeatmap";
import RevenueLineChart from "./RevenueLineChart";
import MiniCalendarPanel from "./MiniCalendarPanel";
import TodayAppointmentsPanel from "./TodayAppointmentsPanel";
import RecentTransactionsPanel from "./RecentTransactionsPanel";
import ProfessionalsPanel from "./ProfessionalsPanel";
import MonthRevenueDonut from "./MonthRevenueDonut";

const DashboardOverview = () => {
  const { metrics, monthlyRevenue, isLoading } = useRealtimeDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroSection />

      <KpiStrip
        todayAppointments={metrics.todayAppointments}
        completedRate={metrics.completedRate}
        newClients={metrics.newClientsThisMonth}
        dayRevenue={metrics.monthRevenue}
      />

      {/* Main Grid: Heatmap + Revenue Chart + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] gap-5">
        <OccupationHeatmap />
        <RevenueLineChart data={monthlyRevenue} />
        <div className="flex flex-col gap-5">
          <MiniCalendarPanel />
          <TodayAppointmentsPanel />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RecentTransactionsPanel />
        <ProfessionalsPanel />
        <MonthRevenueDonut monthRevenue={metrics.monthRevenue} />
      </div>
    </div>
  );
};

export default DashboardOverview;
