import React, { useState } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Scissors, Plus, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: number;
  date: string;
  time: string;
  service: string;
  barber: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

const mockAppointments: Appointment[] = [
  { id: 1, date: "2025-09-25", time: "15:00", service: "Corte + Barba", barber: "Carlos Silva", status: 'confirmed' },
  { id: 2, date: "2025-10-10", time: "10:30", service: "Barba Terapia", barber: "Ana Souza", status: 'pending' },
  { id: 3, date: "2024-12-15", time: "11:00", service: "Corte Clássico", barber: "Roberto Mendes", status: 'completed' },
  { id: 4, date: "2024-12-01", time: "14:00", service: "Combo Premium", barber: "Carlos Silva", status: 'cancelled' },
];

const ClientAppointments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const futureAppointments = mockAppointments.filter(a => new Date(a.date) >= new Date());
  const pastAppointments = mockAppointments.filter(a => new Date(a.date) < new Date());

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-500 hover:bg-green-600 text-white">Confirmado</Badge>;
      case 'pending': return <Badge variant="secondary">Pendente</Badge>;
      case 'completed': return <Badge variant="outline">Concluído</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    setLoading(true);
    // Simulação de cancelamento API
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Agendamento cancelado com sucesso.");
    setLoading(false);
    // Em um sistema real, você invalidaria a query e recarregaria os dados.
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{appointment.service}</h3>
            <p className="text-sm text-muted-foreground">com {appointment.barber}</p>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{appointment.time}</span>
          </div>
        </div>

        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <div className="pt-3 border-t mt-3 flex justify-end">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleCancel(appointment.id)}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meus Agendamentos</h1>
          <Button onClick={() => navigate('/public-booking/seu-id-aqui')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <Tabs defaultValue="agendados">
          <TabsList>
            <TabsTrigger value="agendados">Agendados ({futureAppointments.length})</TabsTrigger>
            <TabsTrigger value="anteriores">Anteriores ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="agendados" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {futureAppointments.length > 0 ? (
                futureAppointments.map(renderAppointmentCard)
              ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Você não tem agendamentos futuros.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="anteriores" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastAppointments.length > 0 ? (
                pastAppointments.map(renderAppointmentCard)
              ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhum agendamento anterior encontrado.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientAppointments;