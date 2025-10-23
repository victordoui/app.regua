import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, Plus, Crown, Handshake, ArrowRight, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const PublicDashboard = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  // Mock Data
  const mockAppointments = [
    { id: 1, date: '25/12/2024', time: '10:00', service: 'Corte + Barba', barber: 'Carlos Silva', status: 'Confirmado' },
    { id: 2, date: '10/01/2025', time: '15:30', service: 'Corte Clássico', barber: 'Ana Souza', status: 'Pendente' },
  ];
  const mockPlanStatus = {
    hasPlan: false,
    planName: 'Nenhum',
    credits: 0,
  };
  const mockPartner = {
    name: 'Academia Fitness Pro',
    discount: '10% de desconto em mensalidades',
  };

  return (
    <div className="space-y-6">
      {/* Banner Promocional (Topo da Área de Conteúdo) */}
      <Card 
        className="shadow-lg overflow-hidden"
        style={{ backgroundColor: 'var(--public-primary)', color: 'white' }}
      >
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">John's Club ganha lavagem grátis</h2>
            <p className="text-sm opacity-90">
              Na compra de qualquer serviço ou calça, limitado a 1 por CPF.
            </p>
            <div className="mt-3 text-xs opacity-80 space-y-1">
              <p>📍 Ecóville: Rua José Izidoro Biazetto, 1324 - Loja 09</p>
              <p>📍 Alto de XV: Rua XV de Novembro, 2600 - Loja 03</p>
            </div>
          </div>
          {/* Imagem Mock (Máquina de Lavar) - Simulação */}
          <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Search className="h-8 w-8 text-white/80" />
          </div>
        </CardContent>
      </Card>

      {/* Próximos Agendamentos e Novo Agendamento (Topo da Tela) */}
      <div className="flex justify-between items-center pt-4">
        <h1 className="text-3xl font-bold">Início</h1>
        <Button 
          onClick={() => navigate(`/public-booking/${userId}/new-appointment`)}
          style={{ backgroundColor: 'var(--public-primary)', color: 'white' }}
          className="hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status do Plano */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seu plano</CardTitle>
            <Crown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-500">Você ainda não assinou um plano.</div>
            <p className="text-sm text-muted-foreground mb-3">
              Contrate e aproveite os benefícios.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 text-primary hover:text-primary/80"
              onClick={() => navigate(`/public-booking/${userId}/plans`)}
            >
              Contrate um plano <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Empresas Parceiras Destaque (Card Grande) */}
        <Card 
          className="lg:col-span-2 shadow-lg cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--public-primary)', color: 'white' }}
          onClick={() => navigate(`/public-booking/${userId}/partners`)}
        >
          <CardContent className="p-6 flex justify-between items-center h-full">
            <div>
              <h2 className="text-xl font-bold mb-1">Conheça o Empresas Parceiras</h2>
              <p className="text-sm opacity-90">
                e pegue seu cupom com vantagens
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-white" />
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <div className="flex justify-between items-center pt-4">
        <h2 className="text-xl font-bold">Próximos agendamentos</h2>
        <Button 
          variant="link" 
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/public-booking/${userId}/appointments`)}
        >
          Ver tudo
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {mockAppointments.length > 0 ? (
            <div className="space-y-4">
              {mockAppointments.map(apt => (
                <div key={apt.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{apt.service} com {apt.barber}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" /> {apt.date} às {apt.time}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{apt.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground mb-3">Você não tem nenhum agendamento marcado</p>
              <Button 
                onClick={() => navigate(`/public-booking/${userId}/new-appointment`)} 
                size="lg"
                style={{ backgroundColor: 'var(--public-primary)', color: 'white' }}
                className="hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicDashboard;