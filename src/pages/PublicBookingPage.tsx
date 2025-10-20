import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CompanySettings } from '@/hooks/useCompanySettings';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Phone, Mail, Scissors } from 'lucide-react';
import Booking from '@/components/Booking'; // Reutilizando o componente de agendamento

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
      // Nota: Esta consulta deve ser feita com a chave anon, mas o RLS deve permitir SELECT
      // na tabela barbershop_settings para usuários ANÔNIMOS, filtrando pelo user_id.
      // Como não podemos alterar o RLS para anônimos aqui, vamos simular a busca
      // e assumir que o RLS será configurado para permitir a leitura pública por user_id.
      
      // Para fins de demonstração, vamos buscar os dados como se estivessem disponíveis publicamente.
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Barbearia Não Encontrada</h1>
          <p className="text-muted-foreground">Verifique o link de acesso.</p>
        </Card>
      </div>
    );
  }

  // Aplica as cores dinâmicas via CSS custom properties
  const dynamicStyles = {
    '--public-primary': settings.primary_color_hex,
    '--public-secondary': settings.secondary_color_hex,
  } as React.CSSProperties;

  return (
    <div style={dynamicStyles} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Dinâmico */}
      <header 
        className="relative h-64 bg-cover bg-center flex items-end p-6"
        style={{ 
          backgroundImage: settings.banner_url ? `url(${settings.banner_url})` : `linear-gradient(135deg, var(--public-secondary), var(--public-primary))`
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-4">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-16 w-16 rounded-full border-4 border-white" />
            ) : (
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center border-4 border-white">
                <Scissors className="h-8 w-8 text-gray-800" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold">{settings.company_name}</h1>
              {settings.slogan && <p className="text-lg font-medium mt-1">{settings.slogan}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Informações de Contato */}
      <Card className="max-w-4xl mx-auto -mt-12 relative z-20 shadow-xl">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {settings.address && (
            <div className="flex flex-col items-center">
              <MapPin className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-muted-foreground">{settings.address}</span>
            </div>
          )}
          {settings.phone && (
            <div className="flex flex-col items-center">
              <Phone className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-muted-foreground">{settings.phone}</span>
            </div>
          )}
          {settings.email && (
            <div className="flex flex-col items-center">
              <Mail className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-muted-foreground">{settings.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Componente de Agendamento (Reutilizado) */}
      <div className="max-w-4xl mx-auto mt-8 pb-16">
        {/* Nota: O componente Booking precisa ser adaptado para usar as cores dinâmicas e dados reais da barbearia */}
        <Booking />
      </div>
    </div>
  );
};

export default PublicBookingPage;