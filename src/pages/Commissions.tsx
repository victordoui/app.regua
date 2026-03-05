import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const Commissions = () => {
  const {
    barbers,
    startDate, setStartDate,
    endDate, setEndDate,
    selectedBarberId, setSelectedBarberId,
    calculatedCommissions,
    isLoading,
  } = useCommissions();
  
  const { rules, isLoading: isLoadingRules } = useCommissionRules();
  const { barbers: allBarbers, services, isLoadingBarbers, isLoadingServices } = useAppointments();
  const defaultRule = rules.length > 0 ? rules[0] : null;
  const { barberSummaries, totalOverallCommission } = calculatedCommissions;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
          <p className="text-muted-foreground">Calcule e gerencie as comissões dos barbeiros.</p>
        </div>

        <Tabs defaultValue="commissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalOverallCommission)}</div>
                  <p className="text-xs text-muted-foreground">No período selecionado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Barbeiros Ativos</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{barberSummaries.length}</div>
                  <p className="text-xs text-muted-foreground">Comissões geradas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa Padrão</CardTitle>
                  <Percent className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {defaultRule
                      ? defaultRule.commission_type === 'percentage'
                        ? `${defaultRule.commission_value}%`
                        : `R$ ${defaultRule.commission_value.toFixed(2)}`
                      : '40%'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {defaultRule ? 'Regra configurada' : 'Valor padrão do sistema'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Barbeiro</label>
                  <Select value={selectedBarberId} onValueChange={setSelectedBarberId}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Todos os Barbeiros" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Barbeiros</SelectItem>
                      {barbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Data Início</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium">Data Fim</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Commissions List */}
            <Card>
              <CardHeader>
                <CardTitle>Comissões por Barbeiro</CardTitle>
                <p className="text-muted-foreground">Detalhes das comissões calculadas para cada barbeiro no período.</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando comissões...</div>
                ) : barberSummaries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma comissão encontrada para o período/filtro.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {barberSummaries.map((summary) => (
                      <Card key={summary.barber_id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Scissors className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold text-lg">{summary.barber_name}</h3>
                            </div>
                            <Badge variant="secondary">{summary.completed_appointments_count} Agendamentos</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Comissão Total:</span>
                            <span className="text-xl font-bold text-green-600">{formatCurrency(summary.total_commission)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Como funciona:</strong> As regras são aplicadas em ordem de prioridade:
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Regra específica para barbeiro + serviço (maior prioridade)</li>
                  <li>Regra para barbeiro (qualquer serviço)</li>
                  <li>Regra para serviço (qualquer barbeiro)</li>
                  <li>Regra padrão (menor prioridade)</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Comissão Padrão</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {defaultRule ? (defaultRule.commission_type === 'percentage' ? `${defaultRule.commission_value}%` : `R$ ${defaultRule.commission_value.toFixed(2)}`) : '40%'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Regras Específicas</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{rules.length}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Barbeiros Ativos</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{allBarbers.length}</div></CardContent>
              </Card>
            </div>

            {isLoadingRules || isLoadingBarbers || isLoadingServices ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-muted-foreground">Carregando regras...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CommissionRulesManager barbers={allBarbers} services={services} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Commissions;
