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
import { TrendingUp } from "lucide-react";

const data = [
  { month: "Out", real: 12400, projecao: null },
  { month: "Nov", real: 15800, projecao: null },
  { month: "Dez", real: 14200, projecao: null },
  { month: "Jan", real: 18900, projecao: null },
  { month: "Fev", real: 16500, projecao: null },
  { month: "Mar", real: 18450, projecao: 18450 },
  { month: "Abr", real: null, projecao: 19800 },
  { month: "Mai", real: null, projecao: 21200 },
  { month: "Jun", real: null, projecao: 22500 },
];

const RevenueForecastChart: React.FC = () => {
  const projectedGrowth = "+22%";

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="font-heading text-[15px] font-bold text-foreground">
            Previsão de Receita
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-[7px] py-0.5 rounded-full bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]">
          Projeção {projectedGrowth} em 3 meses
        </span>
      </div>

      <div className="px-5 pb-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-muted/40 rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-muted-foreground">Realizado</div>
            <div className="font-heading text-sm font-bold text-foreground">R$ 18.4k</div>
          </div>
          <div className="bg-muted/40 rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-muted-foreground">Projeção Jun</div>
            <div className="font-heading text-sm font-bold text-primary">R$ 22.5k</div>
          </div>
          <div className="bg-muted/40 rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-muted-foreground">Meta Anual</div>
            <div className="font-heading text-sm font-bold text-foreground">R$ 250k</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            Realizado
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/40 border border-dashed border-primary" />
            Projeção
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number | null, name: string) => {
                  if (value === null) return ["-", name];
                  return [
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
                    name === "real" ? "Realizado" : "Projeção",
                  ];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="real"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#realGradient)"
                dot={{ r: 3, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="projecao"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="5 4"
                strokeOpacity={0.5}
                fillOpacity={1}
                fill="url(#forecastGradient)"
                dot={{ r: 3, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 1.5, strokeOpacity: 0.5 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueForecastChart;
