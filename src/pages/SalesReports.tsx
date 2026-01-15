import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, BarChart3, Download } from 'lucide-react';
import { useSalesReports, DateRangeType } from '@/hooks/useSalesReports';
import SalesChart from '@/components/reports/SalesChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.2)'];

const SalesReports = () => {
  const { salesData, serviceSales, summary, isLoading, dateRange, setDateRange } = useSalesReports();

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios de Vendas</h1>
            <p className="text-muted-foreground">Análise detalhada de vendas, ticket médio e performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeType)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Receita Total</span>
              </div>
              <p className="text-3xl font-bold mt-2">R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <Badge variant={summary.revenueGrowth >= 0 ? 'default' : 'destructive'} className="mt-2">
                {summary.revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {summary.revenueGrowth.toFixed(1)}% vs período anterior
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Atendimentos</span>
              </div>
              <p className="text-3xl font-bold mt-2">{summary.totalAppointments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
              </div>
              <p className="text-3xl font-bold mt-2">R$ {summary.ticketMedio.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Período Anterior</span>
              </div>
              <p className="text-3xl font-bold mt-2">R$ {summary.prevTotalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <SalesChart data={salesData} />

        {/* Service Sales */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Serviços Mais Vendidos</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={serviceSales.slice(0, 5)} cx="50%" cy="50%" outerRadius={80} dataKey="revenue" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {serviceSales.slice(0, 5).map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Ranking de Serviços</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serviceSales.slice(0, 5).map((service, i) => (
                  <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">{i + 1}º</span>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.count} atendimentos</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">R$ {service.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SalesReports;
