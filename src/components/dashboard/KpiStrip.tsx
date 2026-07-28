import type { ElementType } from "react";
import { Calendar, CheckCircle2, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiStripProps {
  todayAppointments: number;
  completedRate: number;
  newClients: number;
  dayRevenue: number;
}

interface MetricItem {
  label: string;
  value: string;
  context: string;
  icon: ElementType;
  tone: string;
}

const KpiStrip = ({ todayAppointments, completedRate, newClients, dayRevenue }: KpiStripProps) => {
  const metrics: MetricItem[] = [
    { label: "Agendamentos hoje", value: String(todayAppointments), context: "programados para hoje", icon: Calendar, tone: "bg-primary/10 text-primary" },
    { label: "Taxa de conclusão", value: `${completedRate}%`, context: "dos atendimentos", icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Novos clientes", value: String(newClients), context: "neste mês", icon: Users, tone: "bg-violet-500/10 text-violet-600" },
    { label: "Receita do dia", value: dayRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), context: "faturamento confirmado", icon: DollarSign, tone: "bg-sky-500/10 text-sky-600" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article key={metric.label} className="interactive-row group rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-subtle)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-muted-foreground">{metric.label}</p>
                <p className="mt-2 truncate text-[28px] font-black leading-none tracking-[-0.035em] text-foreground">{metric.value}</p>
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground/80">{metric.context}</p>
              </div>
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105", metric.tone)}>
                <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default KpiStrip;
