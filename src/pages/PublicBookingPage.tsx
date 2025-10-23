import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import ClientBookingFlow from '@/components/booking/ClientBookingFlow';
import PublicLayout from '@/components/booking/public/PublicLayout'; // Novo Layout

// Sub-páginas do cliente
import PublicDashboard from './public/PublicDashboard';
import PublicAppointments from './public/PublicAppointments';
import PublicPlans from './public/PublicPlans';
import PublicProfile from './public/PublicProfile';
import PublicPartners from './public/PublicPartners';

interface PublicSettings {
  company_name: string;
  slogan: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_public_page_enabled: boolean;
}

const PublicBookingPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicSettings = useCallback(async () => {
    if (!userId) {
      setError("ID da barbearia não fornecido.");
      setLoading(false);
      return;
    }

    try {
      // Busca as configurações da barbearia
      const { data, error } = await supabase
        .from("barbershop_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        setError("Erro ao carregar as configurações da barbearia.");
        console.error(error);
        return;
      }
      
      if (!data || !data.is_public_page_enabled) {
        setError("Página de agendamento não encontrada ou desativada.");
        return;
      }

      setSettings(data as PublicSettings);
    } catch (err) {
      setError("Ocorreu um erro inesperado ao carregar a página.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Erro</h1>
          <p className="text-muted-foreground">{error || "Barbearia Não Encontrada"}</p>
        </Card>
      </div>
    );
  }

  // Aplica as cores dinâmicas via CSS custom properties
  const dynamicStyles = {
    '--public-primary': settings.primary_color_hex,
    '--public-secondary': settings.secondary_color_hex,
  } as React.CSSProperties;

  // O roteamento interno do cliente
  return (
    <div style={dynamicStyles} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicLayout settings={settings}>
        <Routes>
          {/* Rota de Novo Agendamento (o fluxo de 5 passos) */}
          <Route path="new-appointment" element={
            <div className="max-w-4xl mx-auto pb-16">
              <h1 className="text-3xl font-bold mb-6">Novo Agendamento</h1>
              <ClientBookingFlow />
            </div>
          } />
          
          {/* Rotas do Dashboard do Cliente */}
          <Route path="home" element={<PublicDashboard />} />
          <Route path="appointments" element={<PublicAppointments />} />
          <Route path="partners" element={<PublicPartners />} />
          <Route path="plans" element={<PublicPlans />} />
          <Route path="profile" element={<PublicProfile />} />
          
          {/* Redirecionamento padrão para a home do cliente */}
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </PublicLayout>
    </div>
  );
};

export default PublicBookingPage;