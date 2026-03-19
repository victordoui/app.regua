import React from "react";
import { useSearchParams } from "react-router-dom";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { Users, Star, HeartHandshake } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import AnalyticsDashboard from "./AnalyticsDashboard";

const DashboardOverview = () => {
  const { metrics, monthlyRevenue, isLoading } = useRealtimeDashboard();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    if (value === "overview") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HeroSection />

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="desempenho">
            <Users className="h-4 w-4 mr-1.5" /> Desempenho dos Profissionais
          </TabsTrigger>
          <TabsTrigger value="sucesso-cliente">
            <HeartHandshake className="h-4 w-4 mr-1.5" /> Sucesso do Cliente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-7">
            <KpiStrip
              todayAppointments={metrics.todayAppointments}
              completedRate={metrics.completedRate}
              newClients={metrics.newClientsThisMonth}
              dayRevenue={metrics.todayRevenue}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-4">
              <OccupationHeatmap />
              <RevenueLineChart data={monthlyRevenue} />
              <div className="flex flex-col gap-4">
                <MiniCalendarPanel />
                <TodayAppointmentsPanel />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4 items-start">
              <RecentTransactionsPanel />
              <ProfessionalsPanel />
              <MonthRevenueDonut monthRevenue={metrics.monthRevenue} />
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

            {/* Analytics Dashboard Section */}
            <AnalyticsDashboard />
          </div>
        </TabsContent>

        <TabsContent value="sucesso-cliente">
          <CustomerSuccessContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardOverview;
