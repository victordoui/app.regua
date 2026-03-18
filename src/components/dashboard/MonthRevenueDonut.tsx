import React from "react";

interface MonthRevenueDonutProps {
  monthRevenue: number;
}

const MonthRevenueDonut: React.FC<MonthRevenueDonutProps> = ({ monthRevenue }) => {
  const goal = 27500;
  const percent = Math.min(Math.round((monthRevenue / goal) * 100), 100);
  const remaining = Math.max(goal - monthRevenue, 0);

  return (
    <div className="bg-white border border-[hsl(var(--border))] rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[18px] pt-[14px] pb-[10px]">
        <span className="font-heading text-[13px] font-bold text-foreground">Receita do Mês</span>
        <button className="text-[11px] font-semibold text-primary cursor-pointer hover:text-[hsl(var(--brand))]">
          Detalhes →
        </button>
      </div>

      <div className="px-[18px] pb-[14px]">
        {/* Total */}
        <div className="mb-3">
          <div className="text-[10px] text-muted-foreground mb-0.5">Total em {new Date().toLocaleString('pt-BR', { month: 'long' })}</div>
          <div className="flex items-baseline">
            <span className="font-heading text-2xl font-extrabold text-foreground tracking-tight">
              R$ {monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--success))] ml-2">
              ▲ +14%
            </span>
          </div>
        </div>

        {/* Donut + Legend */}
        <div className="flex items-center gap-[18px] mb-4">
          <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
            <circle cx="45" cy="45" r="32" fill="none" stroke="#F1F5F9" strokeWidth="11" />
            <circle cx="45" cy="45" r="32" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="11"
              strokeDasharray="107 95" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 45 45)" />
            <circle cx="45" cy="45" r="32" fill="none" stroke="hsl(142, 71%, 45%)" strokeWidth="11"
              strokeDasharray="50 152" strokeDashoffset="-107" strokeLinecap="round" transform="rotate(-90 45 45)" />
            <circle cx="45" cy="45" r="32" fill="none" stroke="#F97316" strokeWidth="11"
              strokeDasharray="25 177" strokeDashoffset="-157" strokeLinecap="round" transform="rotate(-90 45 45)" />
            <text x="45" y="43" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="Montserrat,sans-serif" fill="hsl(222, 47%, 11%)">{percent}%</text>
            <text x="45" y="56" textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="Montserrat,sans-serif">da meta</text>
          </svg>

          <div className="flex-1 flex flex-col gap-2">
            {[
              { color: "bg-primary", label: "Corte", pct: "53%" },
              { color: "bg-[hsl(var(--success))]", label: "Barba", pct: "25%" },
              { color: "bg-[#F97316]", label: "Outros", pct: "22%" },
            ].map(item => (
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
            <span className="font-semibold text-foreground">R$ {goal.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-1.5 bg-[hsl(var(--primary-50))] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[hsl(var(--brand-light))] rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0</span>
            <span>Falta R$ {remaining.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthRevenueDonut;
