import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, Star, Clock, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';
import { Button } from '@/components/ui/button';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_price: number;
  services: { name: string; price: number } | null;
  profiles: { display_name: string } | null;
  result_photos: string[] | null;
}

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  slogan: string | null;
  address: string | null;
  phone: string | null;
}

const ClientHistory = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings(settingsData as BarbershopSettings);
      }

      // Fetch client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clientProfile) {
        // Fetch completed appointments
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            status,
            total_price,
            result_photos,
            services (name, price),
            profiles:barber_id (display_name)
          `)
          .eq('client_id', clientProfile.id)
          .eq('status', 'completed')
          .order('appointment_date', { ascending: false });

        if (appointmentsData) {
          setAppointments(appointmentsData as unknown as Appointment[]);
        }
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

  const totalSpent = appointments.reduce((sum, apt) => sum + (apt.total_price || 0), 0);

  return (
    <MobileLayout settings={settings}>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/b/${userId}/home`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meu Histórico</h1>
            <p className="text-muted-foreground">{appointments.length} cortes realizados</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <Scissors className="h-6 w-6 mx-auto mb-2" style={{ color: settings.primary_color_hex }} />
            <p className="text-2xl font-bold">{appointments.length}</p>
            <p className="text-sm text-muted-foreground">Cortes</p>
          </Card>
          <Card className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 fill-yellow-400 text-yellow-400" />
            <p className="text-2xl font-bold">R$ {totalSpent.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Total gasto</p>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Histórico de Cortes</h2>
          
          {appointments.length === 0 ? (
            <Card className="p-8 text-center">
              <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum corte realizado ainda</p>
              <Button 
                className="mt-4"
                onClick={() => navigate(`/b/${userId}/agendar`)}
                style={{ backgroundColor: settings.primary_color_hex }}
              >
                Agendar Agora
              </Button>
            </Card>
          ) : (
            appointments.map((apt, index) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${settings.primary_color_hex}20` }}
                    >
                      <Scissors className="h-6 w-6" style={{ color: settings.primary_color_hex }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{apt.services?.name || 'Serviço'}</p>
                          <p className="text-sm text-muted-foreground">
                            com {apt.profiles?.display_name || 'Barbeiro'}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          R$ {(apt.total_price || apt.services?.price || 0).toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(apt.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {apt.appointment_time}
                        </span>
                      </div>
                      
                      {/* Result Photos */}
                      {apt.result_photos && apt.result_photos.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                          {apt.result_photos.map((photo, i) => (
                            <img 
                              key={i}
                              src={photo}
                              alt={`Resultado ${i + 1}`}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default ClientHistory;
