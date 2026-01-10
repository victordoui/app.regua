import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarPlus, Clock, Scissors, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_name: string;
  service_price: number;
  barber_name: string;
}

// Mock data for demonstration
const mockAppointments: Appointment[] = [
  {
    id: '1',
    appointment_date: '2026-01-15',
    appointment_time: '14:00',
    status: 'confirmed',
    service_name: 'Corte Masculino',
    service_price: 45,
    barber_name: 'Carlos Silva',
  },
  {
    id: '2',
    appointment_date: '2026-01-20',
    appointment_time: '10:30',
    status: 'pending',
    service_name: 'Corte + Barba',
    service_price: 75,
    barber_name: 'João Santos',
  },
  {
    id: '3',
    appointment_date: '2025-12-28',
    appointment_time: '16:00',
    status: 'completed',
    service_name: 'Corte Degradê',
    service_price: 55,
    barber_name: 'Carlos Silva',
  },
  {
    id: '4',
    appointment_date: '2025-12-15',
    appointment_time: '11:00',
    status: 'completed',
    service_name: 'Barba',
    service_price: 35,
    barber_name: 'Pedro Oliveira',
  },
];

const ClientAppointments = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      const { data } = await supabase
        .from('barbershop_settings')
        .select('company_name, logo_url, primary_color_hex, secondary_color_hex, is_public_page_enabled')
        .eq('user_id', userId)
        .single();

      if (data?.is_public_page_enabled) {
        setSettings(data as BarbershopSettings);
      }
      setLoading(false);
    };

    fetchData();
  }, [userId, navigate]);

  const now = new Date();
  const futureAppointments = mockAppointments.filter(apt => 
    isAfter(parseISO(apt.appointment_date), now) || apt.status === 'pending' || apt.status === 'confirmed'
  );
  const pastAppointments = mockAppointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderAppointmentCard = (apt: Appointment, showActions = false) => (
    <motion.div
      key={apt.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-4 rounded-xl">
        <div className="flex items-start gap-4">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: settings?.primary_color_hex || 'hsl(var(--primary))' }}
          >
            <Scissors className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{apt.service_name}</p>
                <p className="text-sm text-muted-foreground">{apt.barber_name}</p>
              </div>
              {getStatusBadge(apt.status)}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(parseISO(apt.appointment_date), 'dd MMM yyyy', { locale: ptBR })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {apt.appointment_time}
              </span>
            </div>
            <p className="mt-2 font-semibold" style={{ color: settings?.primary_color_hex }}>
              R$ {apt.service_price.toFixed(2)}
            </p>
            
            {showActions && (apt.status === 'pending' || apt.status === 'confirmed') && (
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  Reagendar
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Barbearia não encontrada</p>
        </Card>
      </div>
    );
  }

  return (
    <MobileLayout settings={settings}>
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
          <Button 
            size="sm"
            onClick={() => navigate(`/b/${userId}/agendar`)}
            style={{ backgroundColor: settings.primary_color_hex }}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upcoming">Agendados</TabsTrigger>
            <TabsTrigger value="past">Anteriores</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {futureAppointments.length > 0 ? (
              futureAppointments.map(apt => renderAppointmentCard(apt, true))
            ) : (
              <Card className="p-8 text-center rounded-xl">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum agendamento</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você não tem agendamentos futuros
                </p>
                <Button 
                  onClick={() => navigate(`/b/${userId}/agendar`)}
                  style={{ backgroundColor: settings.primary_color_hex }}
                >
                  Agendar Agora
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(apt => renderAppointmentCard(apt, false))
            ) : (
              <Card className="p-8 text-center rounded-xl">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Sem histórico</h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não realizou nenhum agendamento
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default ClientAppointments;
