import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, DollarSign } from 'lucide-react';

const Commissions = () => {
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
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Relatórios detalhados e regras de cálculo de comissão por serviço e profissional.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Commissions;