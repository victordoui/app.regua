import React from 'react';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar as CalendarIcon, DollarSign, Users, Percent, Scissors, Info } from 'lucide-react';
import { useCommissions } from '@/hooks/useCommissions';
import { useCommissionRules } from '@/hooks/useCommissionRules';
import { useAppointments } from '@/hooks/useAppointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import CommissionRulesManager from '@/components/commissions/CommissionRulesManager';
import { PageContainer, PageHeader, WorkspaceEmpty, WorkspaceGuide } from '@/components/ui/workspace-page';
import { StatusCards } from '@/components/ui/workspace-stats';
import { SectionTabsLayout } from '@/components/ui/workspace-sections';

const commissionSections = [
  { value: 'commissions', label: 'Comissões', description: 'Valores da equipe', icon: DollarSign },
  { value: 'rules', label: 'Regras de cálculo', description: 'Percentuais e exceções', icon: Percent },
] as const;

const Commissions = () => {
  const { barbers, startDate, setStartDate, endDate, setEndDate, selectedBarberId, setSelectedBarberId, calculatedCommissions, isLoading, error } = useCommissions();
  const { rules, isLoading: isLoadingRules } = useCommissionRules();
  const { barbers: allBarbers, services, isLoadingBarbers, isLoadingServices } = useAppointments();
  const defaultRule = rules.find(rule => !rule.barber_id && !rule.service_id) || null;
  const { barberSummaries, totalOverallCommission } = calculatedCommissions;
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (error) return <Layout><PageContainer><PageHeader eyebrow="Financeiro" title="Comissões" /><div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"><h2 className="font-bold">Não foi possível calcular as comissões</h2><p className="mt-2 text-sm text-muted-foreground">{typeof error === 'string' ? error : 'Revise as regras ou tente novamente. Não utilize valores incompletos para repasses.'}</p><Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Tentar novamente</Button></div></PageContainer></Layout>;

  return (
    <Layout>
      <PageContainer>
        <PageHeader eyebrow="Financeiro" icon={<Percent className="h-5 w-5" />} title="Comissões" subtitle="Acompanhe os valores da equipe e configure como cada comissão é calculada." />

        <Tabs defaultValue="commissions" className="space-y-6">
          <SectionTabsLayout items={commissionSections} navigationTitle="O que você quer gerenciar?">
          <TabsContent value="commissions" className="mt-0 space-y-6">
            <StatusCards
              className="grid-cols-1 sm:grid-cols-3"
              items={[
                { label: "Comissão Total", value: fmt(totalOverallCommission), icon: <DollarSign className="h-5 w-5" />, color: "green" },
                { label: "Profissionais com comissão", value: barberSummaries.length, icon: <Users className="h-5 w-5" />, color: "blue" },
                { label: "Regra padrão", value: defaultRule ? (defaultRule.commission_type === 'percentage' ? `${defaultRule.commission_value}%` : fmt(defaultRule.commission_value)) : '40%', suffix: 'regras específicas têm prioridade', icon: <Percent className="h-5 w-5" />, color: "purple" },
              ]}
            />

            <WorkspaceGuide title="Como seu resumo é calculado">Somente atendimentos concluídos entram no período. A regra de profissional + serviço tem prioridade; depois vêm profissional, serviço e padrão. Sem uma regra aplicável, o sistema utiliza 40%. A base é o valor salvo no atendimento.</WorkspaceGuide>
            <div className="rounded-[20px] border border-border bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">Profissional</label><Select value={selectedBarberId} onValueChange={setSelectedBarberId}><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.full_name}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-sm font-medium">Data Início</label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR} /></PopoverContent></Popover></div>
                <div><label className="text-sm font-medium">Data Fim</label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={ptBR} /></PopoverContent></Popover></div>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Comissões por Profissional</h3><p className="text-sm text-muted-foreground">Detalhes no período selecionado</p></div>
              <div className="p-5">
                {isLoading ? <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                : barberSummaries.length === 0 ? <WorkspaceEmpty icon={<Scissors className="h-6 w-6" />} title="Nenhuma comissão neste período" description="Os valores aparecem quando há atendimentos concluídos. Confira as datas selecionadas e as regras de cálculo da equipe." />
                : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{barberSummaries.map(s => (
                  <div key={s.barber_id} className="rounded-2xl border border-border p-5">
                    <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Scissors className="h-5 w-5 text-primary" /><h4 className="font-semibold">{s.barber_name}</h4></div><Badge variant="secondary">{s.completed_appointments_count} agendamentos</Badge></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Comissão:</span><span className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(s.total_commission)}</span></div>
                  </div>
                ))}</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-0 space-y-6">
            <Alert><Info className="h-4 w-4" /><AlertDescription><strong>Prioridade:</strong> 1) Profissional + Serviço → 2) Profissional → 3) Serviço → 4) Padrão</AlertDescription></Alert>
            <StatusCards
              className="grid-cols-1 sm:grid-cols-3"
              items={[
                { label: "Comissão Padrão", value: defaultRule ? (defaultRule.commission_type === 'percentage' ? `${defaultRule.commission_value}%` : `R$ ${defaultRule.commission_value.toFixed(2)}`) : '40%', icon: <Percent className="h-5 w-5" />, color: "primary" },
                { label: "Regras Específicas", value: rules.length, icon: <Scissors className="h-5 w-5" />, color: "blue" },
                { label: "Profissionais Ativos", value: allBarbers.length, icon: <Users className="h-5 w-5" />, color: "green" },
              ]}
            />
            {isLoadingRules || isLoadingBarbers || isLoadingServices ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div> : <CommissionRulesManager barbers={allBarbers} services={services} />}
          </TabsContent>
          </SectionTabsLayout>
        </Tabs>
      </PageContainer>
    </Layout>
  );
};

export default Commissions;
