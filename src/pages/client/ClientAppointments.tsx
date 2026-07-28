import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarPlus, Clock, Scissors, Loader2, Calendar, Camera, X, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isAfter, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';
import CancelAppointmentDialog from '@/components/appointments/CancelAppointmentDialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { parseGroupBookingNotes } from '@/lib/groupBooking';
import { translateBookingError } from '@/lib/bookingErrors';

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
  barbeiro_id: string | null;
  duration_minutes: number;
  result_photo_url: string | null;
  attendee_name: string;
  relationship: string | null;
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
  const [canceling, setCanceling] = useState(false);
  
  // Photo viewer state
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    {

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
        .select('id, full_name, phone')
        .eq('user_id', user.id)
        .eq('barbershop_user_id', userId)
        .single();

      if (clientProfile) {
        setClientProfileId(clientProfile.id);
      }

      // Localiza somente o cadastro comercial ligado ao titular autenticado.
      let clientQuery = supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId);

      if (user.email) {
        clientQuery = clientQuery.eq('email', user.email.toLowerCase());
      } else if (clientProfile?.phone) {
        clientQuery = clientQuery.eq('phone', clientProfile.phone.replace(/\D/g, ''));
      }

      const { data: clientsData } = await clientQuery;

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
            barbeiro_id,
            notes,
            total_price,
            appointment_services(service_id, price)
          `)
          .eq('user_id', userId)
          .in('client_id', clientIds)
          .order('appointment_date', { ascending: false });

        if (appointmentsData && appointmentsData.length > 0) {
          // Fetch services and barbers
          const serviceIds = [...new Set(appointmentsData.flatMap(a => [
            a.service_id,
            ...(a.appointment_services || []).map(item => item.service_id),
          ]).filter(Boolean))];
          const barberIds = [...new Set(appointmentsData.map(a => a.barbeiro_id).filter(Boolean))];

          const [servicesRes, barbersRes] = await Promise.all([
            serviceIds.length > 0 
              ? supabase.from('services').select('id, name, price, duration_minutes').in('id', serviceIds)
              : { data: [] as { id: string; name: string; price: number; duration_minutes: number }[] },
            barberIds.length > 0
              ? supabase.from('profiles').select('id, display_name').in('id', barberIds as string[])
              : { data: [] as { id: string; display_name: string }[] }
          ]);

          const servicesMap = new Map<string, { id: string; name: string; price: number; duration_minutes: number }>();
          servicesRes.data?.forEach(s => servicesMap.set(s.id, s));
          
          const barbersMap = new Map<string, { id: string; display_name: string | null }>();
          barbersRes.data?.forEach(b => barbersMap.set(b.id, b));

          const enrichedAppointments: Appointment[] = appointmentsData.map(apt => {
            const service = servicesMap.get(apt.service_id);
            const barber = apt.barbeiro_id ? barbersMap.get(apt.barbeiro_id) : null;
            const metadata = parseGroupBookingNotes(apt.notes);
            const selectedServices = (apt.appointment_services || [])
              .map(item => servicesMap.get(item.service_id))
              .filter(Boolean) as { name: string; duration_minutes: number }[];
            const selectedServiceNames = selectedServices.map(item => item.name);
            const totalDuration = selectedServices.reduce((sum, item) => sum + (item.duration_minutes || 0), 0)
              || service?.duration_minutes
              || 30;
            return {
              id: apt.id,
              appointment_date: apt.appointment_date,
              appointment_time: apt.appointment_time,
              status: apt.status,
              service_name: selectedServiceNames.length > 0 ? selectedServiceNames.join(' + ') : service?.name || 'Serviço',
              service_price: Number(apt.total_price ?? service?.price ?? 0),
              barber_name: barber?.display_name || 'Barbeiro',
              barbeiro_id: apt.barbeiro_id ?? null,
              duration_minutes: totalDuration,
              result_photo_url: apt.result_photo_url,
              attendee_name: metadata.attendeeName || clientProfile?.full_name || 'Você',
              relationship: metadata.relationship,
            };
          });

          setAppointments(enrichedAppointments);
        } else {
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }

      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mantém a lista do cliente sincronizada com alterações feitas na agenda administrativa.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`client-appointments-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `user_id=eq.${userId}` },
        () => { fetchData(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, userId]);


  const now = useMemo(() => new Date(), []);
  
  const { futureAppointments, pastAppointments } = useMemo(() => {
    const future = appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      return (isAfter(aptDate, now) || format(aptDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) 
        && (apt.status === 'pending' || apt.status === 'confirmed');
    }).sort((a, b) => `${a.appointment_date}T${a.appointment_time}`.localeCompare(`${b.appointment_date}T${b.appointment_time}`));
    
    const past = appointments.filter(apt => 
      apt.status === 'completed' || apt.status === 'cancelled'
    ).sort((a, b) => `${b.appointment_date}T${b.appointment_time}`.localeCompare(`${a.appointment_date}T${a.appointment_time}`));
    
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
    if (!cancelingAppointment || canceling) return;

    setCanceling(true);
    try {
      // O cancelamento é feito por função segura no banco: ela revalida o
      // vínculo do cliente, a permissão de cancelamento online e a antecedência.
      const { error } = await supabase.rpc('cancel_client_appointment', {
        _appointment_id: cancelingAppointment.id,
        _reason: reason?.trim() || null,
      });

      if (error) throw new Error(translateBookingError(error.message).message);

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === cancelingAppointment.id
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      );

      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado e o horário foi liberado.",
      });

      setCancelDialogOpen(false);
      setCancelingAppointment(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível cancelar o agendamento.';
      toast({
        title: "Erro ao cancelar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
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
        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <div className="h-1.5" style={{ backgroundColor: settings?.primary_color_hex || 'hsl(var(--primary))' }} />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-muted px-2 py-2 text-center">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{format(parseISO(apt.appointment_date), 'MMM', { locale: ptBR })}</span>
                <span className="text-xl font-extrabold leading-none">{format(parseISO(apt.appointment_date), 'dd')}</span>
                <span className="mt-1 text-xs font-bold" style={{ color: settings?.primary_color_hex }}>{apt.appointment_time.slice(0, 5)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary"><UserRound className="h-3.5 w-3.5" /> {apt.attendee_name}{apt.relationship ? ` · ${apt.relationship}` : ''}</p>
                    <p className="truncate font-bold">{apt.service_name}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><UserRound className="h-3.5 w-3.5" /> com {apt.barber_name}</p>
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
                  <span className="text-xs font-medium capitalize text-muted-foreground">{format(parseISO(apt.appointment_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                  <span className="whitespace-nowrap text-sm font-bold" style={{ color: settings?.primary_color_hex }}>R$ {apt.service_price.toFixed(2)}</span>
                </div>
              
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
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="min-h-11 font-bold"
                    onClick={() => navigate(`/b/${userId}/agendar`)}
                  >
                    Agendar outro
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="min-h-11 font-bold"
                    onClick={() => handleCancelClick(apt)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              </div>
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
      <div className="mx-auto w-full max-w-lg space-y-5 px-4 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sua agenda</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Meus horários</h1>
            <p className="mt-1 text-sm text-muted-foreground">Consulte, remarque ou cancele seus agendamentos.</p>
          </div>
          <Button 
            size="sm"
            onClick={() => navigate(`/b/${userId}/agendar`)}
            className="min-h-11 shrink-0 rounded-xl px-4 font-bold"
            style={{ backgroundColor: settings.primary_color_hex }}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Agendar
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger value="upcoming" className="min-h-10 rounded-lg font-bold">Próximos ({futureAppointments.length})</TabsTrigger>
            <TabsTrigger value="past" className="min-h-10 rounded-lg font-bold">Histórico ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {futureAppointments.length > 0 ? (
              futureAppointments.map(apt => renderAppointmentCard(apt, true))
            ) : (
              <Card className="rounded-2xl border-dashed p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted"><Clock className="h-7 w-7 text-muted-foreground" /></div>
                <h3 className="mb-1 font-bold">Sua agenda está livre</h3>
                <p className="mb-5 text-sm text-muted-foreground">Escolha um serviço e encontre o melhor horário.</p>
                <Button 
                  onClick={() => navigate(`/b/${userId}/agendar`)}
                  className="min-h-11 rounded-xl px-5 font-bold"
                  style={{ backgroundColor: settings.primary_color_hex }}
                >
                  Escolher horário
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(apt => renderAppointmentCard(apt, false))
            ) : (
              <Card className="rounded-2xl border-dashed p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted"><Calendar className="h-7 w-7 text-muted-foreground" /></div>
                <h3 className="mb-1 font-bold">Sem histórico ainda</h3>
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
