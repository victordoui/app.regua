import React, { useState } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import ClientBookingFlow from '@/components/booking/ClientBookingFlow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientBooking = () => {
  const navigate = useNavigate();
  const [hasPlan, setHasPlan] = useState(false); // Mock: Simulação de verificação de plano

  // 1. Paywall/Upgrade Condicional (Requisito 4.2.1)
  if (!hasPlan) {
    return (
      <ClientLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Novo Agendamento</h1>
          
          <Card className="border-primary/50 bg-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                <Crown className="h-6 w-6" /> Upgrade Recomendado
              </CardTitle>
              <CardDescription>
                Faça um upgrade para um de nossos planos e garanta descontos exclusivos, serviços inclusos e agendamento prioritário!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4">
              <Button onClick={() => navigate('/client/plans')} className="flex-1">
                Quero conferir os planos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setHasPlan(true)} // Simula a continuação
                className="flex-1"
              >
                Não tenho interesse (Continuar)
              </Button>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  // 2. Fluxo de Agendamento Completo
  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Novo Agendamento</h1>
        <ClientBookingFlow />
      </div>
    </ClientLayout>
  );
};

export default ClientBooking;