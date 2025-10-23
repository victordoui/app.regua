import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, Plus, Crown, Handshake, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface PublicSettings {
  company_name: string;
  slogan: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_public_page_enabled: boolean;
}

interface PublicDashboardProps {
  settings: PublicSettings;
}

const PublicDashboard: React.FC<PublicDashboardProps> = ({ settings }) => {
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
      {/* Banner de Capa Dinâmico */}
      {settings.banner_url && (
        <div 
          className="relative h-32 md:h-48 bg-cover bg-center rounded-lg shadow-lg overflow-hidden"
          style={{ backgroundImage: `url(${settings.banner_url})` }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h2 className="text-xl md:text-3xl font-bold">{settings.company_name}</h2>
              {settings.slogan && <p className="text-sm md:text-lg mt-1">{settings.slogan}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Bem-vindo, Cliente!</h1>
        <Button onClick={() => navigate(`/public-booking/${userId}/new-appointment`)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Banner Promocional (Ajustado para mobile) */}
      <Card className="bg-gradient-to-r from-primary to-primary-600 text-primary-foreground shadow-lg">
        <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-1">Promoção de Fim de Ano!</h2>
            <p className="text-xs md:text-sm opacity-90">Agende seu combo Corte + Barba e ganhe 10% de desconto.</p>
          </div>
          <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-gray-100 w-full sm:w-auto">
            Agendar Agora
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status do Plano */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Plano</CardTitle>
            <Crown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {mockPlanStatus.hasPlan ? (
              <>
                <div className="text-2xl font-bold text-primary">{mockPlanStatus.planName}</div>
                <p className="text-xs text-muted-foreground">{mockPlanStatus.credits} créditos restantes</p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-red-500">Sem Plano Ativo</div>
                <p className="text-sm text-muted-foreground mb-3">
                  Faça um upgrade e garanta descontos exclusivos!
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-primary text-primary hover:bg-primary/10"
                  onClick={() => navigate(`/public-booking/${userId}/plans`)}
                >
                  Quero conferir os planos
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Próximo Agendamento */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {mockAppointments.length > 0 ? (
              <div className="space-y-3">
                {mockAppointments.slice(0, 2).map(apt => (
                  <div key={apt.id} className="flex justify-between items-center p-3 border rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{apt.service} com {apt.barber}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" /> {apt.date} às {apt.time}
                      </p>
                    </div>
                    <Badge variant="default">{apt.status}</Badge>
                  </div>
                ))}
                <Button 
                  variant="link" 
                  className="w-full justify-end text-primary"
                  onClick={() => navigate(`/public-booking/${userId}/appointments`)}
                >
                  Ver todos os agendamentos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">Você não tem nenhum agendamento marcado.</p>
                <Button onClick={() => navigate(`/public-booking/${userId}/new-appointment`)} size="sm">
                  + Novo Agendamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empresas Parceiras Destaque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            Empresas Parceiras
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/public-booking/${userId}/partners`)}
          >
            Conheça todos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Handshake className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{mockPartner.name}</p>
              <p className="text-sm text-muted-foreground">{mockPartner.discount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicDashboard;