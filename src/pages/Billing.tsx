import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign } from 'lucide-react';

const Billing = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar / Receber</h1>
            <p className="text-muted-foreground">
              Gerencie o fluxo de caixa e as obrigações financeiras.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Aqui você poderá registrar despesas, receitas e acompanhar o status de pagamento.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Billing;