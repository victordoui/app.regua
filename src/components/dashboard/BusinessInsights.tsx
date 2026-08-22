import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import type { DashboardAnalytics, ServiceDistribution } from "@/hooks/useRealtimeDashboard";

const formatPercent = (value: number) => `${Math.abs(value).toFixed(1).replace(".", ",")}%`;

const BusinessInsights = ({ analytics, services }: { analytics: DashboardAnalytics; services: ServiceDistribution[] }) => {
  const topService = services[0];
  const revenuePositive = analytics.revenueTrend >= 0;
  const attendanceHealthy = analytics.attendanceRate >= 85;
  const insights = [
    {
      icon: revenuePositive ? TrendingUp : Target,
      tone: revenuePositive ? "insight-success" : "insight-warning",
      eyebrow: revenuePositive ? "Crescimento" : "Ponto de atenção",
      title: revenuePositive ? `Receita avançou ${formatPercent(analytics.revenueTrend)}` : `Receita recuou ${formatPercent(analytics.revenueTrend)}`,
      description: revenuePositive ? "Seu faturamento está acima do período anterior. Continue acompanhando o ticket médio." : "Revise horários ociosos, retorno de clientes e serviços com maior margem.",
    },
    {
      icon: attendanceHealthy ? Trophy : Zap,
      tone: attendanceHealthy ? "insight-primary" : "insight-warning",
      eyebrow: "Comparecimento",
      title: `${analytics.attendanceRate}% dos horários aproveitados`,
      description: attendanceHealthy ? "Uma taxa saudável que protege a agenda e a receita do negócio." : "Lembretes automáticos e confirmação antecipada podem reduzir faltas.",
    },
    {
      icon: Target,
      tone: "insight-violet",
      eyebrow: "Oportunidade",
      title: topService ? `${topService.name} lidera a procura` : "Descubra seu serviço líder",
      description: topService ? `${topService.percentage.toFixed(1).replace(".", ",")}% dos agendamentos do período. Use esse destaque em campanhas e combos.` : "Cadastre atendimentos para identificar os serviços de maior demanda.",
    },
  ];

  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Leitura do negócio</p>
          <h2 className="text-base font-extrabold text-foreground">O que merece sua atenção agora</h2>
        </div>
        <span className="hidden text-xs font-semibold text-muted-foreground sm:block">Comparação com o período anterior</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {insights.map(({ icon: Icon, tone, eyebrow, title, description }) => (
          <article key={title} className={`dashboard-surface insight-card ${tone} flex gap-3 p-4`}>
            <div className="insight-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p>
              <h3 className="mt-0.5 text-sm font-extrabold text-foreground">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BusinessInsights;
