import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Clock, Scissors, MapPin, Phone, ChevronRight, Loader2, Wallet, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';
import { DigitalWallet } from '@/components/client/DigitalWallet';
import { WhatsAppButton } from '@/components/client/WhatsAppButton';

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
  barber: { display_name: string } | null;
}

interface LastAppointment {
  id: string;
  appointment_date: string;
  service_id: string;
  barber_id: string | null;
  service_name: string;
}

interface WalletData {
  loyaltyPoints: number;
  giftCardBalance: number;
  availableCoupons: number;
}

const ClientHome = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [lastAppointment, setLastAppointment] = useState<LastAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [walletData, setWalletData] = useState<WalletData>({ loyaltyPoints: 0, giftCardBalance: 0, availableCoupons: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      // Garante o perfil do cliente (cadastro com confirmação de email ou login social).
      await ensureClientProfile(userId);

      // Get client profile name
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('full_name, phone')
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
        .from('barbershop_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings(settingsData as BarbershopSettings);
      }

      // Vincula a área do cliente somente ao cadastro comercial do titular autenticado.
      let clientQuery = supabase.from('clients').select('id').eq('user_id', userId);
      if (user.email) {
        clientQuery = clientQuery.eq('email', user.email.toLowerCase());
      } else if (clientProfile?.phone) {
        clientQuery = clientQuery.eq('phone', clientProfile.phone.replace(/\D/g, ''));
      }
      const { data: clientRecord } = await clientQuery.maybeSingle();

      if (clientRecord) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const [appointmentResult, loyaltyResult, giftCardsResult, couponsResult] = await Promise.all([
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
          supabase.from('loyalty_points').select('points').eq('user_id', userId).eq('client_id', clientRecord.id).maybeSingle(),
          user.email
            ? supabase.from('gift_cards').select('current_balance').eq('user_id', userId).eq('recipient_email', user.email.toLowerCase()).eq('status', 'active')
            : Promise.resolve({ data: [], error: null }),
          supabase.from('discount_coupons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('active', true),
        ]);

        const next = appointmentResult.data;
        if (next) {
          const [serviceResult, professionalResult] = await Promise.all([
            supabase.from('services').select('name, price').eq('id', next.service_id).maybeSingle(),
            next.barbeiro_id
              ? supabase.from('profiles').select('display_name').eq('id', next.barbeiro_id).maybeSingle()
              : Promise.resolve({ data: null, error: null }),
          ]);
          setNextAppointment({
            id: next.id,
            appointment_date: next.appointment_date,
            appointment_time: next.appointment_time,
            status: next.status,
            service: serviceResult.data ? { name: serviceResult.data.name, price: Number(serviceResult.data.price) } : null,
            barber: professionalResult.data,
          });
        } else {
          setNextAppointment(null);
        }

        setWalletData({
          loyaltyPoints: loyaltyResult.data?.points || 0,
          giftCardBalance: (giftCardsResult.data || []).reduce((total, card) => total + Number(card.current_balance), 0),
          availableCoupons: couponsResult.count || 0,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, navigate]);

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
            nextRewardAt={100}
            onViewDetails={() => navigate(`/b/${userId}/pagamentos`)}
          />
        </motion.div>

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
              <p className="text-xs font-bold leading-tight">Meus horários</p>
            </Card>
            <Card 
              className="flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-2xl p-3 text-center shadow-sm transition-colors hover:bg-muted"
              onClick={() => navigate(`/b/${userId}/pagamentos`)}
            >
              <Wallet className="mb-2 h-6 w-6" style={{ color: settings.primary_color_hex }} />
              <p className="text-xs font-bold">Carteira</p>
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
