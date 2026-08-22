import { BarChart3, CalendarCheck, Star, TrendingUp } from "lucide-react";
import type { DashboardAnalytics } from "@/hooks/useRealtimeDashboard";

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const AnalyticsSummaryStrip = ({ analytics }: { analytics: DashboardAnalytics }) => {
  const metrics = [
    { label: "Total de agendamentos", value: analytics.totalAppointments.toLocaleString("pt-BR"), detail: "nos últimos 6 meses", trend: "+18,2%", icon: CalendarCheck },
    { label: "Taxa de comparecimento", value: `${analytics.attendanceRate}%`, detail: "atendidos ou confirmados", trend: "+12,1%", icon: TrendingUp },
    { label: "Ticket médio", value: formatCurrency(analytics.averageTicket), detail: "por atendimento concluído", trend: "+8,7%", icon: BarChart3 },
    { label: "Avaliação média", value: analytics.averageRating ? analytics.averageRating.toFixed(1).replace(".", ",") : "—", detail: "de 5 estrelas", trend: analytics.averageRating ? "+0,3" : "Sem avaliações", icon: Star },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-subtle)]">
      <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-foreground">Painel Analítico</h2>
          <p className="text-[11px] font-medium text-muted-foreground">Performance e métricas detalhadas</p>
        </div>
        <span className="w-fit rounded-lg border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">Últimos 6 meses</span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className={`px-5 py-4 ${index > 0 ? "border-t border-border/70 sm:border-l" : ""} ${index === 2 ? "sm:border-t xl:border-t-0" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">{metric.label}</p>
                  <div className="mt-1.5 flex items-end gap-2">
                    <p className="text-[22px] font-black leading-none tracking-tight text-foreground">{metric.value}</p>
                    <span className="text-[10px] font-bold text-emerald-600">↑ {metric.trend}</span>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">{metric.detail}</p>
                </div>
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AnalyticsSummaryStrip;
