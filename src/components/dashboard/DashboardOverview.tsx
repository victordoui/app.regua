import React from "react";
import { useSearchParams } from "react-router-dom";
import TodayScheduleCard from "./TodayScheduleCard";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { Users, HeartHandshake, BarChart3, FileText, FileSpreadsheet, LayoutDashboard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import ComparativeMonthChart from "./analytics/ComparativeMonthChart";
import ConversionFunnel from "./analytics/ConversionFunnel";
import ServiceAnalysisChart from "./analytics/ServiceAnalysisChart";
import RevenueForecastChart from "./analytics/RevenueForecastChart";

const periods = [
  { key: "today", label: "Hoje" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
] as const;

const tabMeta: Record<string, { icon: React.ReactNode; title: string; subtitle: string }> = {
  overview: {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Visão Geral",
    subtitle: "Métricas de performance e operação do seu negócio",
  },
  desempenho: {
    icon: <Users className="h-5 w-5" />,
    title: "Desempenho dos Profissionais",
    subtitle: "Acompanhe a performance individual da sua equipe",
  },
  "sucesso-cliente": {
    icon: <HeartHandshake className="h-5 w-5" />,
    title: "Sucesso do Cliente",
    subtitle: "Satisfação, fidelização e feedbacks dos seus clientes",
  },
};

const DashboardOverview = () => {
  const { metrics, monthlyRevenue, isLoading } = useRealtimeDashboard();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("month");

  const handleTabChange = (value: string) => {
    if (value === "overview") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const activeTabMeta = tabMeta[currentTab] || tabMeta.overview;

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
        <TabsList className="bg-card border border-border p-1.5 gap-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 text-sm font-semibold transition-all"
          >
            <LayoutDashboard className="h-4 w-4 mr-1.5" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="desempenho"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 text-sm font-semibold transition-all"
          >
            <Users className="h-4 w-4 mr-1.5" /> Desempenho
          </TabsTrigger>
          <TabsTrigger
            value="sucesso-cliente"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 text-sm font-semibold transition-all"
          >
            <HeartHandshake className="h-4 w-4 mr-1.5" /> Sucesso do Cliente
          </TabsTrigger>
        </TabsList>

        {/* Active tab indicator */}
        <div className="flex items-center gap-3 mt-4 mb-2 px-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0">
            {activeTabMeta.icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{activeTabMeta.title}</h2>
            <p className="text-sm text-muted-foreground">{activeTabMeta.subtitle}</p>
          </div>
        </div>

        <TabsContent value="overview">
          <div className="space-y-6">
            <KpiStrip
              todayAppointments={metrics.todayAppointments}
              completedRate={metrics.completedRate}
              newClients={metrics.newClientsThisMonth}
              dayRevenue={metrics.todayRevenue}
            />

            {/* Filtros de período e exportação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Painel Analítico</h3>
                  <p className="text-xs text-muted-foreground">Performance e métricas detalhadas</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-0.5">
                  {periods.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPeriod(p.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
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

            {/* Linha 1: Ocupação + Faturamento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <OccupationHeatmap />
              <RevenueLineChart data={monthlyRevenue} />
            </div>

            {/* Linha 2: Comparativo Mensal + Funil de Conversão */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ComparativeMonthChart />
              <ConversionFunnel />
            </div>

            {/* Linha 3: Análise por Serviço + Previsão de Receita */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ServiceAnalysisChart />
              <RevenueForecastChart />
            </div>

            {/* Linha 4: Transações + Profissionais + Receita do Mês */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              <RecentTransactionsPanel />
              <ProfessionalsPanel />
              <MonthRevenueDonut monthRevenue={metrics.monthRevenue} />
            </div>

            {/* Linha 5: Calendário + Agendamentos de Hoje */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <MiniCalendarPanel />
              <TodayAppointmentsPanel />
            </div>

            {/* Linha 6: Agenda de Hoje */}
            <TodayScheduleCard />
          </div>
        </TabsContent>

        <TabsContent value="sucesso-cliente">
          <CustomerSuccessContent />
        </TabsContent>

        <TabsContent value="desempenho">
          <BarberPerformanceContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardOverview;
