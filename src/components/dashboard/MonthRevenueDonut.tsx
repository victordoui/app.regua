import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MonthRevenueDonutProps {
  monthRevenue: number;
}

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "#F97316",
];

const MonthRevenueDonut: React.FC<MonthRevenueDonutProps> = ({ monthRevenue: rawRevenue }) => {
  const monthRevenue = rawRevenue === 0 ? 18450 : rawRevenue;
  const goal = 27500;
  const percent = Math.min(Math.round((monthRevenue / goal) * 100), 100);
  const remaining = Math.max(goal - monthRevenue, 0);

  const donutData = [
    { name: "Corte", value: 53 },
    { name: "Barba", value: 25 },
    { name: "Outros", value: 22 },
  ];

  const legendItems = [
    { color: "bg-primary", label: "Corte", pct: "53%" },
    { color: "bg-[hsl(142,71%,45%)]", label: "Barba", pct: "25%" },
    { color: "bg-[#F97316]", label: "Outros", pct: "22%" },
  ];

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden h-fit">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-heading text-[15px] font-bold text-foreground">Receita do Mês</span>
        <button className="text-[11px] font-semibold text-primary cursor-pointer hover:opacity-80">
          Detalhes →
        </button>
      </div>

      <div className="px-5 pb-4">
        {/* Total */}
        <div className="mb-3">
          <div className="text-[10px] text-muted-foreground mb-0.5">
            Total em {new Date().toLocaleString("pt-BR", { month: "long" })}
          </div>
          <div className="flex items-baseline">
            <span className="font-heading text-2xl font-extrabold text-foreground tracking-tight">
              R$ {monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--success))] ml-2">
              ▲ +14%
            </span>
          </div>
        </div>

        {/* Donut + Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-[90px] h-[90px] flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={38}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading text-xs font-extrabold text-foreground">{percent}%</span>
              <span className="text-[8px] text-muted-foreground">da meta</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  {item.label}
                </div>
                <span className="font-heading text-xs font-bold text-foreground">{item.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal progress */}
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Meta do mês</span>
            <span className="font-semibold text-foreground">R$ {goal.toLocaleString("pt-BR")}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0</span>
            <span>Falta R$ {remaining.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthRevenueDonut;
