import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Settings } from 'lucide-react';

const CompanySettings = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dados da Empresa</h1>
            <p className="text-muted-foreground">
              Gerencie informações básicas e operacionais da barbearia.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <Building className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Aqui você pode atualizar endereço, telefone, CNPJ e outras informações legais.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CompanySettings;