import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign } from 'lucide-react';

const SalesReports = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios de Vendas</h1>
            <p className="text-muted-foreground">
              Análise detalhada de vendas, ticket médio e performance de produtos.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Relatórios de vendas por período, barbeiro e forma de pagamento.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SalesReports;