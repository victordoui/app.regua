import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Crown } from 'lucide-react';

const SubscriptionCreation = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Criar / Editar Plano</h1>
            <p className="text-muted-foreground">
              Configure novos planos de assinatura ou edite os existentes.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <PlusCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Formulário completo para definir nome, preço, ciclo de cobrança e benefícios do plano.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SubscriptionCreation;