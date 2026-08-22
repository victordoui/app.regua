import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface RevenueLineChartProps {
  data: { month: string; revenue: number }[];
  periodLabel: string;
  totalRevenue: number;
  revenueTrend: number;
}

const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data, periodLabel, totalRevenue, revenueTrend }) => {
  const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const metaValue = maxRevenue > 0 ? maxRevenue * 0.75 : 5000;

  return (
    <div className="dashboard-surface h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="font-heading text-[15px] font-bold text-foreground">
          Faturamento Mensal
        </span>
        <span className="rounded-lg border bg-background px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">{periodLabel}</span>
      </div>

      <div className="px-4 pb-4">
        {/* Legend */}
        <div className="flex gap-[14px] mb-3">
          <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            Receita
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success,142_71%_45%))]" />
            Meta
          </div>
        </div>

        {/* Chart */}
        <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_150px]">
        <div className="h-[185px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  "Receita",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              />
              <ReferenceLine
                y={metaValue}
                stroke="hsl(142, 71%, 45%)"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "hsl(var(--background))",
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <aside className="flex flex-col justify-center rounded-xl border border-border bg-background/70 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Total no período</span>
          <strong className="mt-1 text-lg font-black tracking-tight text-foreground">{totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
          <span className={`mt-2 w-fit rounded-full px-2 py-1 text-[10px] font-extrabold ${revenueTrend >= 0 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/10 text-rose-700 dark:text-rose-400"}`}>
            {revenueTrend >= 0 ? "↑" : "↓"} {Math.abs(revenueTrend).toFixed(1).replace(".", ",")}% vs. anterior
          </span>
        </aside>
        </div>
      </div>
    </div>
  );
};

export default RevenueLineChart;
