import TodayScheduleCard from "./TodayScheduleCard";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import HeroSection from "./HeroSection";
import KpiStrip from "./KpiStrip";
import RevenueLineChart from "./RevenueLineChart";
import TodayAppointmentsPanel from "./TodayAppointmentsPanel";
import RecentTransactionsPanel from "./RecentTransactionsPanel";
import { PageContainer } from "@/components/ui/page-header";
import AnalyticsSummaryStrip from "./AnalyticsSummaryStrip";
import ServiceDistributionChart from "./ServiceDistributionChart";

const DashboardOverview = () => {
  const { metrics, monthlyRevenue, analytics, serviceDistribution, isLoading } = useRealtimeDashboard();

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

      <AnalyticsSummaryStrip analytics={analytics} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RevenueLineChart data={monthlyRevenue} />
        <ServiceDistributionChart data={serviceDistribution} />
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
