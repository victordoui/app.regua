import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign } from 'lucide-react';

const Cash = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Caixa e PDV</h1>
            <p className="text-muted-foreground">
              Realize vendas, registre pagamentos e gerencie o caixa diário.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Interface de Ponto de Venda (PDV) para finalização rápida de serviços e produtos.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Cash;