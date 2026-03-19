import React, { useState } from "react";
import { BarChart3, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-card text-primary shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Dashboard Analítico</h2>
            <p className="text-sm text-muted-foreground">Visão geral de performance e métricas do sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-card rounded-lg p-1 gap-0.5">
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

      {/* Row 1: Comparative + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ComparativeMonthChart />
        <ConversionFunnel />
      </div>

      {/* Row 2: Service Analysis + Revenue Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ServiceAnalysisChart />
        <RevenueForecastChart />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
