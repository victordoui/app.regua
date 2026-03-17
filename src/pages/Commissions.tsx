import React from 'react';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PageHeader } from '@/components/ui/page-header';
import { StatusCards } from '@/components/ui/status-cards';

const Commissions = () => {
  const { barbers, startDate, setStartDate, endDate, setEndDate, selectedBarberId, setSelectedBarberId, calculatedCommissions, isLoading } = useCommissions();
  const { rules, isLoading: isLoadingRules } = useCommissionRules();
  const { barbers: allBarbers, services, isLoadingBarbers, isLoadingServices } = useAppointments();
  const defaultRule = rules.length > 0 ? rules[0] : null;
  const { barberSummaries, totalOverallCommission } = calculatedCommissions;
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<Percent className="h-5 w-5" />} title="Comissões" subtitle="Controle de comissões da equipe" />

        <Tabs defaultValue="commissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions" className="space-y-6">
            <StatusCards
              className="grid-cols-1 sm:grid-cols-3"
              items={[
                { label: "Comissão Total", value: fmt(totalOverallCommission), icon: <DollarSign className="h-5 w-5" />, color: "green" },
                { label: "Barbeiros Ativos", value: barberSummaries.length, icon: <Users className="h-5 w-5" />, color: "blue" },
                { label: "Taxa Padrão", value: defaultRule ? (defaultRule.commission_type === 'percentage' ? `${defaultRule.commission_value}%` : `R$ ${defaultRule.commission_value.toFixed(2)}`) : '40%', icon: <Percent className="h-5 w-5" />, color: "purple" },
              ]}
            />

            <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">Barbeiro</label><Select value={selectedBarberId} onValueChange={setSelectedBarberId}><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.full_name}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-sm font-medium">Data Início</label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR} /></PopoverContent></Popover></div>
                <div><label className="text-sm font-medium">Data Fim</label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={ptBR} /></PopoverContent></Popover></div>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Comissões por Barbeiro</h3><p className="text-sm text-muted-foreground">Detalhes no período selecionado</p></div>
              <div className="p-5">
                {isLoading ? <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                : barberSummaries.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Scissors className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Nenhuma comissão encontrada.</p></div>
                : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{barberSummaries.map(s => (
                  <div key={s.barber_id} className="rounded-lg border border-border/40 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Scissors className="h-5 w-5 text-primary" /><h4 className="font-semibold">{s.barber_name}</h4></div><Badge variant="secondary">{s.completed_appointments_count} agendamentos</Badge></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Comissão:</span><span className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(s.total_commission)}</span></div>
                  </div>
                ))}</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Alert><Info className="h-4 w-4" /><AlertDescription><strong>Prioridade:</strong> 1) Barbeiro + Serviço → 2) Barbeiro → 3) Serviço → 4) Padrão</AlertDescription></Alert>
            <StatusCards
              className="grid-cols-1 sm:grid-cols-3"
              items={[
                { label: "Comissão Padrão", value: defaultRule ? (defaultRule.commission_type === 'percentage' ? `${defaultRule.commission_value}%` : `R$ ${defaultRule.commission_value.toFixed(2)}`) : '40%', icon: <Percent className="h-5 w-5" />, color: "primary" },
                { label: "Regras Específicas", value: rules.length, icon: <Scissors className="h-5 w-5" />, color: "blue" },
                { label: "Barbeiros Ativos", value: allBarbers.length, icon: <Users className="h-5 w-5" />, color: "green" },
              ]}
            />
            {isLoadingRules || isLoadingBarbers || isLoadingServices ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div> : <CommissionRulesManager barbers={allBarbers} services={services} />}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Commissions;
