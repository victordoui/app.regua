import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug, MessageSquare } from 'lucide-react';

const Integrations = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
            <p className="text-muted-foreground">
              Conecte o sistema com ferramentas externas, como WhatsApp e sistemas de pagamento.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <Plug className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Configuração de APIs e webhooks para automatizar a comunicação e processos.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Integrations;