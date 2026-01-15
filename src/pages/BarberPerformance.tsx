import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Trophy } from 'lucide-react';
import { useBarberPerformance } from '@/hooks/useBarberPerformance';
import BarberRankingTable from '@/components/reports/BarberRankingTable';
import CancellationAnalysis from '@/components/reports/CancellationAnalysis';

const BarberPerformance = () => {
  const { performanceData, cancellationAnalysis, summary, isLoading } = useBarberPerformance();

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Desempenho dos Barbeiros</h1>
          <p className="text-muted-foreground">Acompanhe as métricas de performance de cada profissional.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Barbeiros Ativos</span>
              </div>
              <p className="text-3xl font-bold mt-2">{summary.totalBarbers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Receita Total</span>
              </div>
              <p className="text-3xl font-bold mt-2">R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Taxa Conclusão Média</span>
              </div>
              <p className="text-3xl font-bold mt-2">{summary.avgCompletionRate.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Top Performer</span>
              </div>
              <p className="text-2xl font-bold mt-2 truncate">{summary.topPerformer}</p>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Table */}
        <BarberRankingTable barbers={performanceData} />

        {/* Cancellation Analysis */}
        <CancellationAnalysis data={cancellationAnalysis} />
      </div>
    </Layout>
  );
};

export default BarberPerformance;
