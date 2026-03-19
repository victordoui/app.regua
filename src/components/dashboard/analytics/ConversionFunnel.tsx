import React from "react";
import { Filter } from "lucide-react";

const funnelData = [
  { label: "Agendados", value: 187, pct: 100, color: "bg-primary" },
  { label: "Confirmados", value: 168, pct: 89.8, color: "bg-[hsl(217,91%,60%)]" },
  { label: "Atendidos", value: 154, pct: 82.4, color: "bg-[hsl(var(--success))]" },
  { label: "Concluídos", value: 148, pct: 79.1, color: "bg-[hsl(142,71%,45%)]" },
  { label: "Cancelados", value: 19, pct: 10.2, color: "bg-[hsl(var(--rose))]" },
  { label: "No-show", value: 12, pct: 6.4, color: "bg-[hsl(var(--warning))]" },
];

const ConversionFunnel: React.FC = () => {
  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-heading text-[15px] font-bold text-foreground">
            Funil de Conversão
          </span>
        </div>
        <button className="flex items-center gap-[5px] border border-border rounded-[7px] px-[10px] py-1 text-[11px] text-muted-foreground bg-transparent cursor-pointer hover:bg-accent/50 transition-colors">
          Este mês
        </button>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Main conversion rate */}
        <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3 mb-1">
          <div>
            <div className="text-[10px] text-muted-foreground">Taxa de Conversão Geral</div>
            <div className="font-heading text-2xl font-extrabold text-foreground">79.1%</div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-[7px] py-0.5 rounded-full bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]">
              ▲ +3.2%
            </span>
            <div className="text-[10px] text-muted-foreground mt-0.5">vs mês anterior</div>
          </div>
        </div>

        {/* Funnel bars */}
        {funnelData.map((item, idx) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-foreground">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-heading text-[13px] font-bold text-foreground">{item.value}</span>
                <span className="text-[10px] text-muted-foreground w-10 text-right">{item.pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-700`}
                style={{ width: `${idx < 4 ? item.pct : item.pct * 2}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionFunnel;
