import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, DollarSign, Users, Percent, Scissors, Settings2 } from 'lucide-react';
import { useCommissions } from '@/hooks/useCommissions';
import { useCommissionRules } from '@/hooks/useCommissionRules';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const Commissions = () => {
  const navigate = useNavigate();
  const {
    barbers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedBarberId,
    setSelectedBarberId,
    calculatedCommissions,
    isLoading,
  } = useCommissions();
  
  const { rules } = useCommissionRules();
  const defaultRule = rules.length > 0 ? rules[0] : null;

  const { barberSummaries, totalOverallCommission } = calculatedCommissions;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
            <p className="text-muted-foreground">
              Calcule e gerencie as comissões dos barbeiros.
            </p>
          </div>
          <Button onClick={() => navigate('/commission-rules')}>
            <Settings2 className="h-4 w-4 mr-2" />
            Gerenciar Regras
          </Button>
        </div>

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
                  : '40%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {defaultRule ? 'Regra configurada' : 'Valor padrão do sistema'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label htmlFor="barber-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Barbeiro</label>
              <Select
                value={selectedBarberId}
                onValueChange={setSelectedBarberId}
              >
                <SelectTrigger id="barber-select" className="w-full">
                  <SelectValue placeholder="Todos os Barbeiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Barbeiros</SelectItem>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label htmlFor="end-date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões por Barbeiro</CardTitle>
            <p className="text-muted-foreground">
              Detalhes das comissões calculadas para cada barbeiro no período.
            </p>
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
      </div>
    </Layout>
  );
};

export default Commissions;