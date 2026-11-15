import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CalendarPlus, Clock, Scissors, MapPin, Phone, ChevronRight, Loader2, Wallet, RotateCcw, Star, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';
import { DigitalWallet } from '@/components/client/DigitalWallet';
import { WhatsAppButton } from '@/components/client/WhatsAppButton';
import { ensureClientProfile } from '@/lib/clientProfile';
import { Textarea } from '@/components/ui/textarea';
import { addBusinessCalendarDays, businessDateTimeToISOString, formatBusinessDateInput, getBusinessMonthDateRange } from '@/lib/formatters';
import { buildAppointmentReminderCalendar } from '@/lib/appointmentReminder';


interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  slogan: string | null;
  address: string | null;
  phone: string | null;
  whatsapp_number: string | null;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service: { name: string; price: number } | null;
  duration_minutes: number;
  barber: { display_name: string } | null;
}

interface LastAppointment {
  id: string;
  client_id: string;
  appointment_date: string;
  service_id: string;
  barber_id: string | null;
  service_name: string;
}

interface WalletData {
  loyaltyPoints: number;
  giftCardBalance: number;
  availableCoupons: number;
  nextRewardAt: number | null;
  monthlySpend: number;
}

interface ClientReminderNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

function downloadAppointmentReminder(appointment: Appointment, companyName: string) {
  const calendar = buildAppointmentReminderCalendar({
    id: appointment.id,
    appointment_date: appointment.appointment_date,
    appointment_time: appointment.appointment_time,
    duration_minutes: appointment.duration_minutes,
    service_name: appointment.service?.name || null,
  }, companyName);
  const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vizzu-lembrete-${appointment.appointment_date}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

const ClientHome = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [lastAppointment, setLastAppointment] = useState<LastAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [walletData, setWalletData] = useState<WalletData>({ loyaltyPoints: 0, giftCardBalance: 0, availableCoupons: 0, nextRewardAt: null, monthlySpend: 0 });
  const [reviewedLastAppointment, setReviewedLastAppointment] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [reminderNotifications, setReminderNotifications] = useState<ClientReminderNotification[]>([]);
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoadError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      // Garante o perfil do cliente (cadastro com confirmação de email ou login social).
      await ensureClientProfile(userId);

      const { data: clientReminders, error: clientRemindersError } = await supabase
        .from('client_notifications')
        .select('id, title, message, created_at')
        .eq('user_id', user.id)
        .eq('business_user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(5);
      if (clientRemindersError) throw clientRemindersError;
      setReminderNotifications(clientReminders || []);

      // Get client profile name
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('full_name, phone, client_id')
        .eq('user_id', user.id)
        .eq('barbershop_user_id', userId)
        .maybeSingle();


      if (clientProfile) {
        setUserName(clientProfile.full_name.split(' ')[0]);
      } else {
        const fallbackName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Cliente';
        setUserName(fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));
      }

      // Fetch barbershop settings
      const { data: settingsData } = await supabase
        .from('public_business_profile')
        .select('company_name, logo_url, banner_url, primary_color_hex, secondary_color_hex, slogan, address, phone, whatsapp_number')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings(settingsData as BarbershopSettings);
      }

      // Prioriza o vínculo autenticado e mantém um fallback legado protegido por RLS.
      let clientQuery = supabase.from('clients').select('id').eq('user_id', userId);
      if (clientProfile?.client_id) {
        clientQuery = clientQuery.eq('id', clientProfile.client_id);
      } else if (user.email) {
        clientQuery = clientQuery.eq('email', user.email.toLowerCase());
      } else if (clientProfile?.phone) {
        clientQuery = clientQuery.eq('phone', clientProfile.phone.replace(/\D/g, ''));
      }
      const { data: clientRecord } = await clientQuery.maybeSingle();

      if (clientRecord) {
        const now = new Date();
        const today = formatBusinessDateInput(now);
        const monthRange = getBusinessMonthDateRange(now);
        const monthStart = businessDateTimeToISOString(monthRange.start);
        const nextMonthStart = businessDateTimeToISOString(addBusinessCalendarDays(monthRange.end, 1));
        const [appointmentResult, lastAppointmentResult, loyaltyResult, giftCardsResult, couponsResult, rewardResult, paymentsResult] = await Promise.all([
          supabase
            .from('appointments')
            .select('id, appointment_date, appointment_time, status, service_id, barbeiro_id')
            .eq('user_id', userId)
            .eq('client_id', clientRecord.id)
            .gte('appointment_date', today)
            .in('status', ['pending', 'confirmed'])
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('appointments')
            .select('id, client_id, appointment_date, service_id, barbeiro_id')
            .eq('user_id', userId)
            .eq('client_id', clientRecord.id)
            .eq('status', 'completed')
            .lte('appointment_date', today)
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase.from('loyalty_points').select('points').eq('user_id', userId).eq('client_id', clientRecord.id).maybeSingle(),
          user.email
            ? supabase.from('gift_cards').select('current_balance').eq('user_id', userId).eq('recipient_email', user.email.toLowerCase()).eq('status', 'active')
            : Promise.resolve({ data: [], error: null }),
          supabase.from('discount_coupons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('active', true),
          supabase.from('loyalty_rewards').select('points_required').eq('user_id', userId).eq('active', true).order('points_required', { ascending: true }).limit(1).maybeSingle(),
          supabase.from('payments').select('amount').eq('user_id', userId).eq('status', 'completed').gte('created_at', monthStart).lt('created_at', nextMonthStart),
        ]);

        const next = appointmentResult.data;
        if (next) {
          const [serviceResult, professionalResult] = await Promise.all([
            supabase.from('services').select('name, price, duration_minutes').eq('id', next.service_id).maybeSingle(),
            next.barbeiro_id
              ? supabase.from('professional_directory').select('display_name').eq('id', next.barbeiro_id).maybeSingle()
              : Promise.resolve({ data: null, error: null }),
          ]);
          setNextAppointment({
            id: next.id,
            appointment_date: next.appointment_date,
            appointment_time: next.appointment_time,
            status: next.status,
            service: serviceResult.data ? { name: serviceResult.data.name, price: Number(serviceResult.data.price) } : null,
            duration_minutes: Number(serviceResult.data?.duration_minutes || 30),
            barber: professionalResult.data,
          });
        } else {
          setNextAppointment(null);
        }

        const last = lastAppointmentResult.data;
        if (last) {
          const [serviceResult, reviewResult] = await Promise.all([
            supabase.from('services').select('name').eq('id', last.service_id).maybeSingle(),
            supabase.from('reviews').select('id').eq('appointment_id', last.id).eq('client_id', clientRecord.id).maybeSingle(),
          ]);
          setLastAppointment({
            id: last.id,
            client_id: last.client_id,
            appointment_date: last.appointment_date,
            service_id: last.service_id,
            barber_id: last.barbeiro_id,
            service_name: serviceResult.data?.name || 'último serviço',
          });
          setReviewedLastAppointment(Boolean(reviewResult.data));
        } else {
          setLastAppointment(null);
          setReviewedLastAppointment(false);
        }

        setWalletData({
          loyaltyPoints: loyaltyResult.data?.points || 0,
          giftCardBalance: (giftCardsResult.data || []).reduce((total, card) => total + Number(card.current_balance), 0),
          availableCoupons: couponsResult.count || 0,
          nextRewardAt: rewardResult.data?.points_required ?? null,
          monthlySpend: (paymentsResult.data || []).reduce((total, payment) => total + Number(payment.amount || 0), 0),
        });
      } else {
        setNextAppointment(null);
        setLastAppointment(null);
        setReviewedLastAppointment(false);
        setWalletData({ loyaltyPoints: 0, giftCardBalance: 0, availableCoupons: 0, nextRewardAt: null, monthlySpend: 0 });
      }

      setLoading(false);
      } catch (error) {
        console.error('Não foi possível carregar o início do cliente:', error);
        setLoadError('Não foi possível carregar seus dados agora. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  const markReminderAsRead = async (notificationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('client_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id);
    if (error) {
      setReminderFeedback('Não foi possível dispensar este lembrete. Tente novamente.');
      return;
    }
    setReminderNotifications((current) => current.filter((item) => item.id !== notificationId));
    setReminderFeedback(null);
  };

  const submitLastReview = async () => {
    if (!lastAppointment || !userId || submittingReview || reviewedLastAppointment) return;
    setSubmittingReview(true);
    setReviewFeedback(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Entre na sua conta para avaliar o atendimento.');
      const { error } = await supabase.from('reviews').insert({
        user_id: userId,
        appointment_id: lastAppointment.id,
        client_id: lastAppointment.client_id,
        barber_id: lastAppointment.barber_id,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      if (error) throw error;
      setReviewedLastAppointment(true);
      setReviewFeedback('Obrigado! Sua avaliação foi enviada para a barbearia.');
    } catch (error) {
      setReviewFeedback(error instanceof Error ? error.message : 'Não foi possível enviar sua avaliação agora.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <MobileLayout settings={settings || undefined}>
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md space-y-4 p-6 text-center" role="alert">
            <h1 className="text-xl font-bold">Não conseguimos carregar seu início</h1>
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </Card>
        </div>
      </MobileLayout>
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <MobileLayout settings={settings}>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-5">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 space-y-4"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">{getGreeting()},</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{userName}!</h1>
          </div>

          {/* Banner CTA */}
          <Card 
            className="relative overflow-hidden rounded-2xl border-0 p-5 text-white shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${settings.primary_color_hex}, ${settings.secondary_color_hex})` 
            }}
          >
            <div className="relative z-10 max-w-[78%]">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-white/75">Agendamento online</p>
              <h2 className="text-xl font-bold leading-tight">Seu próximo horário, sem complicação</h2>
              <p className="mb-4 mt-2 text-sm text-white/85">Agende para você ou para quem vier com você.</p>
              <Button 
                onClick={() => navigate(`/b/${userId}/agendar`)}
                className="min-h-11 px-5 font-bold text-slate-900 hover:brightness-95"
                style={{ backgroundColor: '#ffffff', backgroundImage: 'none' }}
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Agendar horário
              </Button>
            </div>
            <Scissors className="absolute -bottom-4 -right-4 h-32 w-32 rotate-12 text-white/15" />
          </Card>
        </motion.div>

        {reminderNotifications.length > 0 && (
          <Card className="order-2 border-primary/20 bg-primary/5 p-4 shadow-sm" aria-label="Lembretes de atendimento">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Lembretes de atendimento</h2>
            </div>
            <div className="space-y-3">
              {reminderNotifications.map((reminder) => (
                <div key={reminder.id} className="flex items-start justify-between gap-3 border-t border-primary/10 pt-3 first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">{reminder.message}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0" onClick={() => void markReminderAsRead(reminder.id)}>
                    Dispensar
                  </Button>
                </div>
              ))}
            </div>
            {reminderFeedback && <p role="status" className="mt-2 text-xs text-destructive">{reminderFeedback}</p>}
          </Card>
        )}

        {/* Digital Wallet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="order-4"
        >
          <DigitalWallet 
            loyaltyPoints={walletData.loyaltyPoints}
            giftCardBalance={walletData.giftCardBalance}
            availableCoupons={walletData.availableCoupons}
            nextRewardAt={walletData.nextRewardAt}
            onViewDetails={() => navigate(`/b/${userId}/pagamentos`)}
          />
        </motion.div>

        <Card className="order-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Receipt className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Gastos no mês</p>
              <p className="text-xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(walletData.monthlySpend)}</p>
              <p className="text-xs text-muted-foreground">Pagamentos confirmados neste mês</p>
            </div>
          </div>
        </Card>

        {/* Next Appointment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="order-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sua agenda</p>
              <h2 className="text-lg font-bold">Próximo agendamento</h2>
            </div>
            <button 
              onClick={() => navigate(`/b/${userId}/agendamentos`)}
              className="flex min-h-10 items-center gap-1 px-2 text-sm font-bold text-primary"
              style={{ color: settings.primary_color_hex }}
            >
              Ver todos <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {nextAppointment ? (
            <Card className="rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div 
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: settings.primary_color_hex }}
                >
                  <Scissors className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{nextAppointment.service?.name || 'Serviço'}</p>
                  <p className="text-sm text-muted-foreground">
                    {nextAppointment.barber?.display_name || 'Barbeiro'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {format(parseISO(nextAppointment.appointment_date), 'dd MMM', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">{nextAppointment.appointment_time.slice(0, 5)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-muted-foreground"><Bell className="h-4 w-4 shrink-0" />Baixe o lembrete para receber avisos 24h e 2h antes no seu calendário.</p>
                <Button variant="outline" size="sm" className="shrink-0" onClick={() => downloadAppointmentReminder(nextAppointment, settings.company_name)}>Baixar lembrete</Button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl border-dashed p-5">
              <div className="flex items-center gap-4 text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold">Nenhum horário marcado</p>
                  <p className="text-sm text-muted-foreground">Use o botão acima para escolher seu melhor horário.</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {lastAppointment && (
          <Card className="order-3 rounded-2xl shadow-sm">
            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Atendimento concluído</p>
                <h2 className="mt-1 text-lg font-bold">Como foi seu último serviço?</h2>
                <p className="text-sm text-muted-foreground">{lastAppointment.service_name} · {format(parseISO(lastAppointment.appointment_date), 'dd/MM/yyyy')}</p>
              </div>
              {reviewedLastAppointment ? (
                <p className="rounded-xl bg-primary/5 p-3 text-sm text-primary">Obrigado por avaliar este atendimento.</p>
              ) : (
                <>
                  <div className="flex items-center gap-1" role="group" aria-label="Escolha uma nota de 1 a 5 estrelas">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button key={rating} type="button" variant="ghost" size="icon" aria-label={`${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={reviewRating === rating} onClick={() => setReviewRating(rating)}>
                        <Star className={`h-6 w-6 ${rating <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />
                      </Button>
                    ))}
                  </div>
                  <Textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value.slice(0, 500))} maxLength={500} placeholder="Conte como foi (opcional)" aria-label="Comentário da avaliação" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{reviewComment.length}/500 caracteres</span>
                    <Button onClick={() => void submitLastReview()} disabled={submittingReview}>{submittingReview ? 'Enviando…' : 'Enviar avaliação'}</Button>
                  </div>
                </>
              )}
              {reviewFeedback && <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{reviewFeedback}</p>}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="order-3"
        >
          <h2 className="mb-3 text-lg font-bold">Acesso rápido</h2>
          <div className="grid grid-cols-3 gap-2.5">
            <Card 
              className="flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-2xl p-3 text-center shadow-sm transition-colors hover:bg-muted"
              onClick={() => navigate(`/b/${userId}/agendar`)}
            >
              <CalendarPlus className="mb-2 h-6 w-6" style={{ color: settings.primary_color_hex }} />
              <p className="text-xs font-bold">Agendar</p>
            </Card>
            <Card 
              className="flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-2xl p-3 text-center shadow-sm transition-colors hover:bg-muted"
              onClick={() => navigate(`/b/${userId}/agendamentos`)}
            >
              <Clock className="mb-2 h-6 w-6" style={{ color: settings.primary_color_hex }} />
              <p className="text-xs font-bold leading-tight">Meus agendamentos</p>
            </Card>
            <Card 
              className="flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-2xl p-3 text-center shadow-sm transition-colors hover:bg-muted"
              onClick={() => navigate(`/b/${userId}/pagamentos`)}
            >
              <Wallet className="mb-2 h-6 w-6" style={{ color: settings.primary_color_hex }} />
              <p className="text-xs font-bold">Meus pagamentos</p>
            </Card>
            {lastAppointment && (
              <Card 
                className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow col-span-3"
                onClick={() => {
                  // Navigate to booking with pre-filled data
                  navigate(`/b/${userId}/agendar`, { 
                    state: { 
                      rebookServiceId: lastAppointment.service_id,
                      rebookBarberId: lastAppointment.barber_id 
                    } 
                  });
                }}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-6 w-6" style={{ color: settings.primary_color_hex }} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Repetir último agendamento</p>
                    <p className="text-xs text-muted-foreground">{lastAppointment.service_name}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Barbershop Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="order-5"
        >
          <h2 className="mb-3 text-lg font-bold">Onde você será atendido</h2>
          <Card className="space-y-3 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.company_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: settings.primary_color_hex }}
                >
                  {settings.company_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold">{settings.company_name}</p>
                {settings.slogan && (
                  <p className="text-sm text-muted-foreground">{settings.slogan}</p>
                )}
              </div>
            </div>

            {settings.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{settings.address}</p>
              </div>
            )}

            {settings.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a 
                  href={`tel:${settings.phone}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {settings.phone}
                </a>
              </div>
            )}

            {settings.whatsapp_number && (
              <div className="border-t border-border/70 pt-3">
                <WhatsAppButton
                  phoneNumber={settings.whatsapp_number}
                  companyName={settings.company_name}
                  floating={false}
                  className="h-11 w-full rounded-xl"
                />
              </div>
            )}

          </Card>
        </motion.div>
      </div>

    </MobileLayout>
  );
};

export default ClientHome;
