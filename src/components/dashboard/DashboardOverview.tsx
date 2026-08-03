import React from "react";
import TodayScheduleCard from "./TodayScheduleCard";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { BarChart3, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "./HeroSection";
import KpiStrip from "./KpiStrip";
import RevenueLineChart from "./RevenueLineChart";
import TodayAppointmentsPanel from "./TodayAppointmentsPanel";
import RecentTransactionsPanel from "./RecentTransactionsPanel";
import { PageContainer } from "@/components/ui/page-header";

const periods = [
  { key: "today", label: "Hoje" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
] as const;

const DashboardOverview = () => {
  const { metrics, monthlyRevenue, isLoading } = useRealtimeDashboard();
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("month");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <PageContainer>
      <HeroSection />

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
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 rounded-xl bg-muted/70 p-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedPeriod === p.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
        </div>
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
