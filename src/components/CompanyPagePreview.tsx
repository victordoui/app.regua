import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, MapPin, Phone, Mail, Eye } from 'lucide-react';

interface PreviewData {
  company_name: string;
  slogan: string;
  logo_url: string;
  banner_url: string;
  primary_color_hex: string;
  secondary_color_hex: string;
  address: string;
  phone: string;
  email: string;
}

interface CompanyPagePreviewProps {
  data: PreviewData;
}

const CompanyPagePreview: React.FC<CompanyPagePreviewProps> = ({ data }) => {
  const dynamicStyles = {
    '--public-primary': data.primary_color_hex,
    '--public-secondary': data.secondary_color_hex,
  } as React.CSSProperties;

  return (
    <Card className="border-2 border-dashed border-primary/50 shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-sm text-primary flex items-center gap-2">
          <Eye className="h-4 w-4" /> Pré-visualização da Página Pública
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={dynamicStyles} className="w-full bg-gray-50 dark:bg-gray-900">
          {/* Header Dinâmico */}
          <header 
            className="relative h-40 bg-cover bg-center flex items-end p-4"
            style={{ 
              backgroundImage: data.banner_url ? `url(${data.banner_url})` : `linear-gradient(135deg, var(--public-secondary), var(--public-primary))`,
              backgroundColor: data.secondary_color_hex,
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 text-white flex items-center gap-3">
              {data.logo_url ? (
                <img src={data.logo_url} alt="Logo" className="h-12 w-12 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border-2 border-white">
                  <Scissors className="h-6 w-6 text-gray-800" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{data.company_name || 'Nome da Barbearia'}</h3>
                {data.slogan && <p className="text-sm font-medium mt-0.5">{data.slogan}</p>}
              </div>
            </div>
          </header>

          {/* Informações de Contato (Simuladas) */}
          <div className="p-4 bg-card border-t">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <MapPin className="h-4 w-4 text-gray-500 mb-1" style={{ color: data.primary_color_hex }} />
                <span className="text-xs text-muted-foreground">{data.address || 'Endereço'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="h-4 w-4 text-gray-500 mb-1" style={{ color: data.primary_color_hex }} />
                <span className="text-xs text-muted-foreground">{data.phone || 'Telefone'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="h-4 w-4 text-gray-500 mb-1" style={{ color: data.primary_color_hex }} />
                <span className="text-xs text-muted-foreground">{data.email || 'Email'}</span>
              </div>
            </div>
          </div>
          
          {/* Botão de Agendamento (Simulado com cor primária) */}
          <div className="p-4 text-center">
            <button 
              className="w-full py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: data.primary_color_hex }}
            >
              Agendar Agora (Simulado)
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyPagePreview;