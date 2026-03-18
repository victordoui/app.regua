import React from "react";
import { Calendar, CheckCircle, Users, DollarSign, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface KpiStripProps {
  todayAppointments: number;
  completedRate: number;
  newClients: number;
  dayRevenue: number;
}

const KpiStrip: React.FC<KpiStripProps> = ({ todayAppointments, completedRate, newClients, dayRevenue }) => {
  const kpis = [
    {
      label: "Agendamentos Hoje",
      value: todayAppointments.toString(),
      color: "blue" as const,
      iconBg: "bg-[hsl(var(--primary-50))]",
      icon: <Calendar className="h-5 w-5 text-primary" strokeWidth={1.8} />,
      tag: { type: "up" as const, text: "+12%" },
      foot: "vs ontem",
      link: "/appointments",
    },
    {
      label: "Taxa de Conclusão",
      value: `${completedRate}%`,
      valueColor: "text-[hsl(var(--success))]",
      color: "green" as const,
      iconBg: "bg-[hsl(var(--success-bg))]",
      icon: <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" strokeWidth={1.8} />,
      tag: { type: "up" as const, text: "+5%" },
      foot: "esta semana",
      link: "/reports",
    },
    {
      label: "Novos Clientes",
      value: newClients.toString(),
      valueColor: "text-[hsl(var(--warning))]",
      color: "amber" as const,
      iconBg: "bg-[hsl(var(--warning-bg))]",
      icon: <Users className="h-5 w-5 text-[hsl(var(--warning))]" strokeWidth={1.8} />,
      tag: { type: "down" as const, text: `${newClients}` },
      foot: "este mês",
      link: "/clients",
    },
    {
      label: "Receita do Dia",
      value: `R$ ${dayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
      color: "rose" as const,
      iconBg: "bg-[hsl(var(--rose-bg))]",
      icon: <DollarSign className="h-5 w-5 text-[hsl(var(--rose))]" strokeWidth={1.8} />,
      tag: { type: "up" as const, text: "+8%" },
      foot: "vs ontem",
      link: "/billing",
    },
  ];

  const borderColors = {
    blue: "before:bg-primary",
    green: "before:bg-[hsl(var(--success))]",
    amber: "before:bg-[hsl(var(--warning))]",
    rose: "before:bg-[hsl(var(--rose))]",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-[fadeUp_0.4s_ease_both]">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`relative overflow-hidden bg-card border border-border rounded-[14px] p-5 min-h-[140px] flex flex-col justify-between cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(15,23,42,0.07)] hover:-translate-y-px
            before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[3px] before:rounded-l-[14px] ${borderColors[kpi.color]}`}
        >
          {/* Top row: label + icon */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {kpi.label}
              </div>
              <div className={`font-heading text-2xl font-bold leading-none tracking-tight ${kpi.valueColor || 'text-foreground'}`}>
                {kpi.value}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.iconBg}`}>
              {kpi.icon}
            </div>
          </div>

          {/* Bottom row: tag + link */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-[7px] py-0.5 rounded-full
                ${kpi.tag.type === 'up' ? 'bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]' : 'bg-[hsl(var(--rose-bg))] text-[hsl(var(--rose))]'}`}>
                {kpi.tag.type === 'up' ? '▲' : '▼'} {kpi.tag.text}
              </span>
              {kpi.foot}
            </div>
            <a href={kpi.link} className="text-[11px] font-medium text-primary hover:text-primary/80 inline-flex items-center gap-0.5 transition-colors">
              Ver detalhes <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiStrip;
