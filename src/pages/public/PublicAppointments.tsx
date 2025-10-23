import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const PublicAppointments = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const mockAppointments = [
    { id: 1, date: '25/12/2024', time: '10:00', service: 'Corte + Barba', barber: 'Carlos Silva', status: 'Confirmado', future: true },
    { id: 2, date: '10/01/2025', time: '15:30', service: 'Corte Clássico', barber: 'Ana Souza', status: 'Pendente', future: true },
    { id: 3, date: '01/12/2024', time: '11:00', service: 'Barba Terapia', barber: 'Roberto Mendes', status: 'Concluído', future: false },
    { id: 4, date: '15/11/2024', time: '14:00', service: 'Corte Clássico', barber: 'Carlos Silva', status: 'Cancelado', future: false },
  ];

  const futureAppointments = mockAppointments.filter(a => a.future);
  const pastAppointments = mockAppointments.filter(a => !a.future);

  const renderAppointmentList = (appointments: typeof mockAppointments) => (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum agendamento nesta categoria.
        </div>
      ) : (
        appointments.map(apt => (
          <Card key={apt.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="font-semibold text-lg">{apt.service}</p>
                  <p className="text-sm text-muted-foreground">Com {apt.barber}</p>
                </div>
                <span className={`text-sm font-medium mt-2 sm:mt-0 ${
                  apt.status === 'Confirmado' ? 'text-green-600' :
                  apt.status === 'Pendente' ? 'text-yellow-600' :
                  apt.status === 'Concluído' ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {apt.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {apt.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {apt.time}
                </div>
              </div>
              {apt.future && apt.status !== 'Cancelado' && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    Reagendar
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Meus Agendamentos</h1>
        <Button onClick={() => navigate(`/public-booking/${userId}/new-appointment`)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Tabs defaultValue="future">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="future">Agendados ({futureAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Anteriores ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="future" className="mt-4">
          {renderAppointmentList(futureAppointments)}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {renderAppointmentList(pastAppointments)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicAppointments;