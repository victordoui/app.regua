import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import MobileLayout from '@/components/mobile/MobileLayout';
import ClientBookingFlow from '@/components/booking/ClientBookingFlow';

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
}

const ClientBooking = () => {
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
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Novo Agendamento</h1>
        <ClientBookingFlow />
      </div>
    </MobileLayout>
  );
};

export default ClientBooking;
