import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, Clock, Scissors, MapPin, Phone, Star, ChevronRight, Loader2, Wallet, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
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

const ClientHome = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [lastAppointment, setLastAppointment] = useState<LastAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      // Get client profile name
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (clientProfile) {
        setUserName(clientProfile.full_name.split(' ')[0]);
      } else {
        setUserName(user.email?.split('@')[0] || 'Cliente');
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

      // Fetch next appointment (mock for now - would need proper query)
      // In a real implementation, we'd join with services and profiles tables
      setNextAppointment(null);

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
      <div className="px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <p className="text-muted-foreground">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-foreground">{userName}!</h1>
          </div>

          {/* Banner CTA */}
          <Card 
            className="relative overflow-hidden p-6 text-white rounded-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${settings.primary_color_hex}, ${settings.secondary_color_hex})` 
            }}
          >
            <div className="relative z-10">
              <h2 className="text-lg font-semibold mb-2">Pronto para um novo visual?</h2>
              <p className="text-sm text-white/80 mb-4">Agende seu próximo corte com a gente</p>
              <Button 
                onClick={() => navigate(`/b/${userId}/agendar`)}
                className="bg-white text-foreground hover:bg-white/90"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Agendar Agora
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20">
              <Scissors className="h-32 w-32 transform rotate-45" />
            </div>
          </Card>
        </motion.div>

        {/* Digital Wallet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DigitalWallet 
            loyaltyPoints={45}
            giftCardBalance={0}
            availableCoupons={1}
            nextRewardAt={100}
            onViewDetails={() => navigate(`/b/${userId}/pagamentos`)}
          />
        </motion.div>

        {/* Next Appointment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Próximo Agendamento</h2>
            <button 
              onClick={() => navigate(`/b/${userId}/agendamentos`)}
              className="text-sm text-primary flex items-center gap-1"
              style={{ color: settings.primary_color_hex }}
            >
              Ver todos <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {nextAppointment ? (
            <Card className="p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div 
                  className="h-14 w-14 rounded-full flex items-center justify-center text-white"
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
                    {format(new Date(nextAppointment.appointment_date), 'dd MMM', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">{nextAppointment.appointment_time}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 rounded-xl text-center">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">Você não tem agendamentos próximos</p>
              <Button 
                onClick={() => navigate(`/b/${userId}/agendar`)}
                style={{ backgroundColor: settings.primary_color_hex }}
              >
                Agendar Agora
              </Button>
            </Card>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-3">Acesso Rápido</h2>
          <div className="grid grid-cols-3 gap-3">
            <Card 
              className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/b/${userId}/agendar`)}
            >
              <CalendarPlus className="h-7 w-7 mb-2" style={{ color: settings.primary_color_hex }} />
              <p className="font-medium text-xs">Agendar</p>
            </Card>
            <Card 
              className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/b/${userId}/agendamentos`)}
            >
              <Clock className="h-7 w-7 mb-2" style={{ color: settings.primary_color_hex }} />
              <p className="font-medium text-xs">Meus Cortes</p>
            </Card>
            <Card 
              className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/b/${userId}/pagamentos`)}
            >
              <Wallet className="h-7 w-7 mb-2" style={{ color: settings.primary_color_hex }} />
              <p className="font-medium text-xs">Carteira</p>
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
        >
          <h2 className="text-lg font-semibold mb-3">Sobre a Barbearia</h2>
          <Card className="p-4 rounded-xl space-y-3">
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

            <div className="flex items-center gap-2 pt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                4.8
              </Badge>
              <span className="text-xs text-muted-foreground">156 avaliações</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Floating WhatsApp Button */}
      {settings.whatsapp_number && (
        <WhatsAppButton 
          phoneNumber={settings.whatsapp_number}
          companyName={settings.company_name}
          floating
        />
      )}
    </MobileLayout>
  );
};

export default ClientHome;
