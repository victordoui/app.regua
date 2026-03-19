import React from "react";
import { BarChart3, TrendingUp, Filter, PieChart } from "lucide-react";
import ComparativeMonthChart from "./analytics/ComparativeMonthChart";
import ConversionFunnel from "./analytics/ConversionFunnel";
import ServiceAnalysisChart from "./analytics/ServiceAnalysisChart";
import RevenueForecastChart from "./analytics/RevenueForecastChart";

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Dashboard Analítico</h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold ml-1">
          Insights
        </span>
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
