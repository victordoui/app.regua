import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Target } from 'lucide-react';

const BarberPerformance = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Desempenho dos Barbeiros</h1>
            <p className="text-muted-foreground">
              Acompanhe as métricas de performance de cada profissional.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Aqui você verá gráficos e relatórios de produtividade, satisfação e receita por barbeiro.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BarberPerformance;