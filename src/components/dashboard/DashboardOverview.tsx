import TodayScheduleCard from "./TodayScheduleCard";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { BarChart3 } from "lucide-react";
import HeroSection from "./HeroSection";
import KpiStrip from "./KpiStrip";
import RevenueLineChart from "./RevenueLineChart";
import TodayAppointmentsPanel from "./TodayAppointmentsPanel";
import RecentTransactionsPanel from "./RecentTransactionsPanel";
import { PageContainer } from "@/components/ui/page-header";

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
    <PageContainer>
      <HeroSection todayAppointments={metrics.todayAppointments} />

      <KpiStrip
        todayAppointments={metrics.todayAppointments}
        completedRate={metrics.completedRate}
        newClients={metrics.newClientsThisMonth}
        dayRevenue={metrics.todayRevenue}
      />

      {/* Filtros de período e exportação */}
      <div className="surface-toolbar p-4 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-section">Painel Analítico</h3>
            <p className="text-section-sub">Performance e métricas detalhadas</p>
          </div>
        </div>
        <span className="rounded-lg border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
          Receita dos últimos 6 meses
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <RevenueLineChart data={monthlyRevenue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <RecentTransactionsPanel />
        <TodayAppointmentsPanel />
      </div>

      <TodayScheduleCard />
    </PageContainer>
  );
};

export default DashboardOverview;
