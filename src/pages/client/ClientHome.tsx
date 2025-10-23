import React from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, Briefcase, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientHome = () => {
  const navigate = useNavigate();
  
  // Mock Data
  const hasPlan = false;
  const nextAppointment = {
    date: "25/09/2025",
    time: "15:00",
    service: "Corte + Barba",
    barber: "Carlos Silva"
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Bem-vindo(a)!</h1>
        
        {/* Banner Promocional */}
        <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-primary-foreground shadow-lg">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Promoção de Lançamento!</h2>
              <p className="text-sm opacity-90">Agende seu primeiro serviço e ganhe 10% de desconto.</p>
            </div>
            <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Agendar Agora
            </Button>
          </CardContent>
        </Card>

        {/* Status do Plano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Crown className="h-5 w-5 text-primary" /> Status do Seu Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasPlan ? (
              <div className="space-y-2">
                <Badge variant="default" className="text-lg">Plano VIP Ativo</Badge>
                <p className="text-muted-foreground">Próxima cobrança em: 15/10/2025</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <p className="text-lg font-medium text-muted-foreground">
                  Você ainda não assinou um plano.
                </p>
                <Button onClick={() => navigate('/client/plans')}>
                  <Crown className="h-4 w-4 mr-2" />
                  Contrate um Plano
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" /> Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="border p-4 rounded-lg space-y-2">
                <p className="text-lg font-semibold">{nextAppointment.service} com {nextAppointment.barber}</p>
                <p className="text-sm text-muted-foreground">
                  Data: <span className="font-medium">{nextAppointment.date}</span> às <span className="font-medium">{nextAppointment.time}</span>
                </p>
                <Button size="sm" variant="outline" onClick={() => navigate('/client/appointments')}>
                  Ver Detalhes
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-muted-foreground">Você não tem nenhum agendamento marcado.</p>
                <Button onClick={() => navigate('/public-booking/seu-id-aqui')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empresas Parceiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-5 w-5 text-primary" /> Empresas Parceiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <p className="text-lg font-medium text-muted-foreground">
                Descubra descontos exclusivos com nossos parceiros.
              </p>
              <Button variant="outline" onClick={() => navigate('/client/partners')}>
                Conheça as Empresas Parceiras
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientHome;