import React from 'react';
import { StatusCards } from '@/components/ui/workspace-stats';
import { WorkspaceGuide } from '@/components/ui/workspace-page';
import { SectionTabsLayout } from '@/components/ui/workspace-sections';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Users, DollarSign, TrendingUp, Trophy, Star } from 'lucide-react';
import { useBarberPerformance } from '@/hooks/useBarberPerformance';
import BarberRankingTable from '@/components/reports/BarberRankingTable';
import CancellationAnalysis from '@/components/reports/CancellationAnalysis';
import ReviewsContent from '@/components/dashboard/ReviewsContent';

const BarberPerformanceContent = () => {
  const { performanceData, cancellationAnalysis, summary: realSummary, isLoading, error, refetch } = useBarberPerformance();
  
  const summary = realSummary;
  if (isLoading) return <p className="text-muted-foreground" role="status">Carregando desempenho dos profissionais…</p>;
  if (error) return <div role="alert" className="rounded-2xl border border-destructive/30 p-6"><p>Não foi possível carregar o desempenho da equipe.</p><button className="mt-3 text-primary underline" onClick={() => refetch()}>Tentar novamente</button></div>;

  return (
    <div className="space-y-6">
      <WorkspaceGuide title="Leitura do mês atual">Compare a produtividade da equipe, entenda os cancelamentos e acompanhe a experiência de quem foi atendido.</WorkspaceGuide>

      <StatusCards items={[
        { label: 'Profissionais', value: summary.totalBarbers, icon: <Users className="h-5 w-5" />, suffix: 'na equipe', color: 'blue' },
        { label: 'Receita concluída', value: summary.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <DollarSign className="h-5 w-5" />, suffix: 'no mês atual', color: 'green' },
        { label: 'Conclusão média', value: `${summary.avgCompletionRate.toFixed(0)}%`, icon: <TrendingUp className="h-5 w-5" />, suffix: 'dos atendimentos da equipe', color: 'primary' },
        { label: 'Destaque em receita', value: summary.totalRevenue > 0 ? summary.topPerformer : '—', icon: <Trophy className="h-5 w-5" />, suffix: summary.totalRevenue > 0 ? 'no mês atual' : 'aguardando atendimentos concluídos', color: 'amber' },
      ]} />

      <Tabs defaultValue="team"><SectionTabsLayout items={[
        { value: 'team', label: 'Equipe', description: 'Produtividade e receita', icon: Users },
        { value: 'cancellations', label: 'Cancelamentos', description: 'Recupere oportunidades', icon: TrendingUp },
        { value: 'reviews', label: 'Avaliações', description: 'A voz dos clientes', icon: Star },
      ]}>
        <TabsContent value="team"><BarberRankingTable barbers={performanceData} /></TabsContent>
        <TabsContent value="cancellations"><CancellationAnalysis data={cancellationAnalysis} /></TabsContent>
        <TabsContent value="reviews"><ReviewsContent /></TabsContent>
      </SectionTabsLayout></Tabs>
    </div>
  );
};

export default BarberPerformanceContent;
