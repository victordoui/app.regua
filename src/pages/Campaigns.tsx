import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Zap } from 'lucide-react';

const Campaigns = () => {
  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campanhas / Marketing</h1>
            <p className="text-muted-foreground">
              Crie e gerencie campanhas promocionais e de engajamento.
            </p>
          </div>
        </div>

        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            <Megaphone className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Em Desenvolvimento</CardTitle>
            <p className="text-muted-foreground">
              Esta seção permitirá a criação de campanhas segmentadas por SMS, Email e WhatsApp.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Campaigns;