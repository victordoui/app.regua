import { useMemo, useState } from "react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import type { DashboardFilters } from "@/hooks/useRealtimeDashboard";
import HeroSection from "./HeroSection";
import KpiStrip from "./KpiStrip";
import RevenueLineChart from "./RevenueLineChart";
import TodayAppointmentsPanel from "./TodayAppointmentsPanel";
import RecentTransactionsPanel from "./RecentTransactionsPanel";
import { PageContainer } from "@/components/ui/page-header";
import AnalyticsSummaryStrip from "./AnalyticsSummaryStrip";
import ServiceDistributionChart from "./ServiceDistributionChart";
import DashboardFilterBar from "./DashboardFilterBar";
import BusinessInsights from "./BusinessInsights";

const DashboardOverview = () => {
  const [filters, setFilters] = useState<DashboardFilters>({ periodMonths: 6, status: "all", service: "all" });
  const { metrics, monthlyRevenue, analytics, serviceDistribution, serviceOptions, isLoading, isRefreshing, refetch } = useRealtimeDashboard(filters);
  const periodLabel = useMemo(() => `Últimos ${filters.periodMonths} meses`, [filters.periodMonths]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <PageContainer className="dashboard-overview space-y-4">
      <HeroSection todayAppointments={metrics.todayAppointments} />

      <KpiStrip
        todayAppointments={metrics.todayAppointments}
        completedRate={metrics.completedRate}
        newClients={metrics.newClientsThisMonth}
        dayRevenue={metrics.todayRevenue}
      />

      <section className="dashboard-surface overflow-hidden">
        <DashboardFilterBar embedded filters={filters} serviceOptions={serviceOptions} isRefreshing={isRefreshing} onChange={setFilters} onRefresh={refetch} />
        <AnalyticsSummaryStrip embedded analytics={analytics} periodLabel={periodLabel} />
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueLineChart data={monthlyRevenue} periodLabel={periodLabel} totalRevenue={analytics.totalRevenue} revenueTrend={analytics.revenueTrend} />
        <ServiceDistributionChart data={serviceDistribution} periodLabel={periodLabel} />
      </div>

      <BusinessInsights analytics={analytics} services={serviceDistribution} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <RecentTransactionsPanel />
        <TodayAppointmentsPanel />
      </div>
    </PageContainer>
  );
};

export default DashboardOverview;
