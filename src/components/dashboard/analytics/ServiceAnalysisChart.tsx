import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PieChart } from "lucide-react";

const serviceData = [
  { name: "Corte Degradê", revenue: 6240, count: 78, ticket: 80, color: "hsl(var(--primary))" },
  { name: "Barba Completa", revenue: 3750, count: 50, ticket: 75, color: "hsl(217, 91%, 60%)" },
  { name: "Corte + Barba", revenue: 3920, count: 28, ticket: 140, color: "hsl(142, 71%, 45%)" },
  { name: "Pigmentação", revenue: 2400, count: 16, ticket: 150, color: "hsl(var(--warning))" },
  { name: "Sobrancelha", revenue: 1140, count: 38, ticket: 30, color: "hsl(var(--rose))" },
  { name: "Hidratação", revenue: 1000, count: 10, ticket: 100, color: "hsl(280, 67%, 55%)" },
];

const ServiceAnalysisChart: React.FC = () => {
  const totalRevenue = serviceData.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          <span className="font-heading text-[15px] font-bold text-foreground">
            Análise por Serviço
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Total: <strong className="text-foreground">R$ {totalRevenue.toLocaleString("pt-BR")}</strong>
        </span>
      </div>

      <div className="px-5 pb-5">
        {/* Top services list */}
        <div className="space-y-2.5 mb-4">
          {serviceData.slice(0, 4).map((svc, idx) => (
            <div key={svc.name} className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-muted-foreground w-4">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-foreground truncate">{svc.name}</span>
                  <span className="font-heading text-[12px] font-bold text-foreground ml-2">
                    R$ {svc.revenue.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(svc.revenue / serviceData[0].revenue) * 100}%`,
                      backgroundColor: svc.color,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-muted-foreground">{svc.count} atendimentos</span>
                  <span className="text-[9px] text-muted-foreground">Ticket: R$ {svc.ticket}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={serviceData}
              layout="vertical"
              margin={{ top: 0, right: 5, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString("pt-BR")}`,
                  "Receita",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ServiceAnalysisChart;
