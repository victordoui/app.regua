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
}

const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const metaValue = maxRevenue > 0 ? maxRevenue * 0.75 : 5000;

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden h-full">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-heading text-[15px] font-bold text-foreground">
          Faturamento Mensal
        </span>
        <button className="flex items-center gap-[5px] border border-border rounded-[7px] px-[10px] py-1 text-[11px] text-muted-foreground bg-transparent cursor-pointer hover:bg-accent/50 transition-colors">
          Últimos 6 meses
        </button>
      </div>

      <div className="px-5 pb-5">
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
        <div className="h-[200px]">
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
      </div>
    </div>
  );
};

export default RevenueLineChart;
