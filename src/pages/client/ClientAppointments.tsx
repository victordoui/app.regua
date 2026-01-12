import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarPlus, Clock, Scissors, Loader2, Calendar, Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isAfter, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';
import CancelAppointmentDialog from '@/components/appointments/CancelAppointmentDialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  allow_online_cancellation: boolean;
  cancellation_hours_before: number;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_name: string;
  service_price: number;
  barber_name: string;
  result_photo_url: string | null;
}

const ClientAppointments = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  
  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelingAppointment, setCancelingAppointment] = useState<Appointment | null>(null);
  
  // Photo viewer state
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      // Fetch barbershop settings
      const { data: settingsData } = await supabase
        .from('barbershop_settings')
        .select('company_name, logo_url, primary_color_hex, secondary_color_hex, is_public_page_enabled, allow_online_cancellation, cancellation_hours_before')
        .eq('user_id', userId)
        .single();

      if (!settingsData?.is_public_page_enabled) {
        setLoading(false);
        return;
      }

      setSettings({
        company_name: settingsData.company_name,
        logo_url: settingsData.logo_url,
        primary_color_hex: settingsData.primary_color_hex,
        secondary_color_hex: settingsData.secondary_color_hex,
        allow_online_cancellation: settingsData.allow_online_cancellation ?? true,
        cancellation_hours_before: settingsData.cancellation_hours_before ?? 24,
      });

      // Fetch client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('barbershop_user_id', userId)
        .single();

      if (clientProfile) {
        setClientProfileId(clientProfile.id);
      }

      // Fetch appointments - find client by user_id match or phone
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId);

      if (clientsData && clientsData.length > 0) {
        const clientIds = clientsData.map(c => c.id);
        
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            status,
            result_photo_url,
            service_id,
            barbeiro_id
          `)
          .eq('user_id', userId)
          .in('client_id', clientIds)
          .order('appointment_date', { ascending: false });

        if (appointmentsData && appointmentsData.length > 0) {
          // Fetch services and barbers
          const serviceIds = [...new Set(appointmentsData.map(a => a.service_id).filter(Boolean))];
          const barberIds = [...new Set(appointmentsData.map(a => a.barbeiro_id).filter(Boolean))];

          const [servicesRes, barbersRes] = await Promise.all([
            serviceIds.length > 0 
              ? supabase.from('services').select('id, name, price').in('id', serviceIds)
              : { data: [] as { id: string; name: string; price: number }[] },
            barberIds.length > 0
              ? supabase.from('profiles').select('id, display_name').in('id', barberIds as string[])
              : { data: [] as { id: string; display_name: string }[] }
          ]);

          const servicesMap = new Map<string, { id: string; name: string; price: number }>();
          servicesRes.data?.forEach(s => servicesMap.set(s.id, s));
          
          const barbersMap = new Map<string, { id: string; display_name: string | null }>();
          barbersRes.data?.forEach(b => barbersMap.set(b.id, b));

          const enrichedAppointments: Appointment[] = appointmentsData.map(apt => {
            const service = servicesMap.get(apt.service_id);
            const barber = apt.barbeiro_id ? barbersMap.get(apt.barbeiro_id) : null;
            return {
              id: apt.id,
              appointment_date: apt.appointment_date,
              appointment_time: apt.appointment_time,
              status: apt.status,
              service_name: service?.name || 'Serviço',
              service_price: service?.price || 0,
              barber_name: barber?.display_name || 'Barbeiro',
              result_photo_url: apt.result_photo_url,
            };
          });

          setAppointments(enrichedAppointments);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, navigate]);

  const now = new Date();
  
  const { futureAppointments, pastAppointments } = useMemo(() => {
    const future = appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      return (isAfter(aptDate, now) || format(aptDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) 
        && (apt.status === 'pending' || apt.status === 'confirmed');
    });
    
    const past = appointments.filter(apt => 
      apt.status === 'completed' || apt.status === 'cancelled'
    );
    
    return { futureAppointments: future, pastAppointments: past };
  }, [appointments, now]);

  const canCancelAppointment = (apt: Appointment): { canCancel: boolean; error?: string } => {
    if (!settings?.allow_online_cancellation) {
      return { canCancel: false, error: 'Cancelamento online não está habilitado. Entre em contato com a barbearia.' };
    }

    const appointmentDateTime = parseISO(`${apt.appointment_date}T${apt.appointment_time}`);
    const hoursUntilAppointment = differenceInHours(appointmentDateTime, now);

    if (hoursUntilAppointment < settings.cancellation_hours_before) {
      return { 
        canCancel: false, 
        error: `Cancelamento deve ser feito com no mínimo ${settings.cancellation_hours_before} horas de antecedência. Faltam apenas ${Math.max(0, Math.floor(hoursUntilAppointment))} horas.`
      };
    }

    return { canCancel: true };
  };

  const handleCancelClick = (apt: Appointment) => {
    setCancelingAppointment(apt);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async (reason?: string) => {
    if (!cancelingAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          notes: reason ? `Cancelado pelo cliente: ${reason}` : 'Cancelado pelo cliente'
        })
        .eq('id', cancelingAppointment.id);

      if (error) throw error;

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === cancelingAppointment.id 
            ? { ...apt, status: 'cancelled' } 
            : apt
        )
      );

      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado com sucesso.",
      });

      setCancelDialogOpen(false);
      setCancelingAppointment(null);
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const renderAppointmentCard = (apt: Appointment, showActions = false) => {
    const cancelCheck = canCancelAppointment(apt);
    
    return (
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
                  {apt.appointment_time.slice(0, 5)}
                </span>
              </div>
              <p className="mt-2 font-semibold" style={{ color: settings?.primary_color_hex }}>
                R$ {apt.service_price.toFixed(2)}
              </p>
              
              {/* Result Photo */}
              {apt.result_photo_url && apt.status === 'completed' && (
                <div className="mt-3">
                  <button 
                    onClick={() => setViewingPhoto(apt.result_photo_url)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Camera className="h-4 w-4" />
                    Ver foto do resultado
                  </button>
                </div>
              )}
              
              {showActions && (apt.status === 'pending' || apt.status === 'confirmed') && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/b/${userId}/agendar`)}
                  >
                    Reagendar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCancelClick(apt)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

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

      {/* Cancel Dialog */}
      {cancelingAppointment && (
        <CancelAppointmentDialog
          isOpen={cancelDialogOpen}
          onClose={() => {
            setCancelDialogOpen(false);
            setCancelingAppointment(null);
          }}
          onConfirm={handleConfirmCancel}
          appointmentDate={format(parseISO(cancelingAppointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
          appointmentTime={cancelingAppointment.appointment_time.slice(0, 5)}
          canCancel={canCancelAppointment(cancelingAppointment).canCancel}
          cancellationError={canCancelAppointment(cancelingAppointment).error}
        />
      )}

      {/* Photo Viewer Dialog */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setViewingPhoto(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {viewingPhoto && (
              <img 
                src={viewingPhoto} 
                alt="Resultado do atendimento" 
                className="w-full h-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default ClientAppointments;
