import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { metric: "Receita", atual: 18450, anterior: 16500 },
  { metric: "Agendamentos", atual: 187, anterior: 162 },
  { metric: "Novos Clientes", atual: 23, anterior: 18 },
  { metric: "Ticket Médio", atual: 98, anterior: 92 },
];

const ComparativeMonthChart: React.FC = () => {
  const overallGrowth = "+15.4%";

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[15px] font-bold text-foreground">
            Comparativo Mensal
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-[7px] py-0.5 rounded-full bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]">
            ▲ {overallGrowth}
          </span>
        </div>
        <button className="flex items-center gap-[5px] border border-border rounded-[7px] px-[10px] py-1 text-[11px] text-muted-foreground bg-transparent cursor-pointer hover:bg-accent/50 transition-colors">
          Mar vs Fev
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {data.map((item) => {
            const growth = ((item.atual - item.anterior) / item.anterior * 100).toFixed(1);
            const isPositive = item.atual >= item.anterior;
            return (
              <div key={item.metric} className="bg-muted/40 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground mb-0.5">{item.metric}</div>
                <div className="font-heading text-sm font-bold text-foreground">
                  {item.metric === "Receita" ? `R$ ${(item.atual / 1000).toFixed(1)}k` :
                   item.metric === "Ticket Médio" ? `R$ ${item.atual}` : item.atual}
                </div>
                <span className={`text-[9px] font-semibold ${isPositive ? "text-[hsl(var(--success))]" : "text-[hsl(var(--rose))]"}`}>
                  {isPositive ? "▲" : "▼"} {growth}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="metric"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}>
                    {value === "atual" ? "Mês Atual" : "Mês Anterior"}
                  </span>
                )}
              />
              <Bar dataKey="anterior" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} />
              <Bar dataKey="atual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ComparativeMonthChart;
