import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, HeartHandshake, Users, Star } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "visao-geral";

  const handleTabChange = (value: string) => {
    if (value === "visao-geral") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: value });
    }
  };

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

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="bg-muted/50 border border-border/50 p-1 rounded-xl">
          <TabsTrigger value="visao-geral" className="gap-1.5 text-xs">
            <LayoutDashboard className="h-3.5 w-3.5" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="sucesso-cliente" className="gap-1.5 text-xs">
            <HeartHandshake className="h-3.5 w-3.5" /> Sucesso do Cliente
          </TabsTrigger>
          <TabsTrigger value="desempenho" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Desempenho
          </TabsTrigger>
          <TabsTrigger value="avaliacoes" className="gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5" /> Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-7 mt-6">
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
        </TabsContent>

        <TabsContent value="sucesso-cliente">
          <CustomerSuccessContent />
        </TabsContent>

        <TabsContent value="desempenho">
          <BarberPerformanceContent />
        </TabsContent>

        <TabsContent value="avaliacoes">
          <ReviewsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardOverview;
