import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const PublicDashboard = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const mockAppointments = [
    { id: 1, date: '25/12/2024', time: '10:00', service: 'Corte + Barba', barber: 'Carlos Silva', status: 'Confirmado' },
    { id: 2, date: '10/01/2025', time: '15:30', service: 'Corte Clássico', barber: 'Ana Souza', status: 'Pendente' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bem-vindo, Cliente!</h1>
        <Button onClick={() => navigate(`/public-booking/${userId}/new-appointment`)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Agendamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {mockAppointments.length > 0 ? (
              <>
                <div className="text-2xl font-bold">{mockAppointments[0].date}</div>
                <p className="text-xs text-muted-foreground">{mockAppointments[0].service} com {mockAppointments[0].barber} às {mockAppointments[0].time}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">VIP Mensal</div>
            <p className="text-xs text-muted-foreground">3 créditos restantes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Agendamentos Futuros</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicDashboard;