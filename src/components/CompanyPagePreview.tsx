import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, MapPin, Phone, Mail, Eye, Instagram, Facebook, MessageCircle, User, Clock } from 'lucide-react';

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
  instagram_url?: string;
  facebook_url?: string;
  whatsapp_number?: string;
}

interface CompanyPagePreviewProps {
  data: PreviewData;
}

const CompanyPagePreview: React.FC<CompanyPagePreviewProps> = ({ data }) => {
  const dynamicStyles = {
    '--public-primary': data.primary_color_hex,
    '--public-secondary': data.secondary_color_hex,
  } as React.CSSProperties;

  const hasSocialMedia = data.instagram_url || data.facebook_url || data.whatsapp_number;

  return (
    <Card className="border-2 border-dashed border-primary/50 shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/50 py-3">
        <CardTitle className="text-sm text-primary flex items-center gap-2">
          <Eye className="h-4 w-4" /> Pré-visualização da Página Pública
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={dynamicStyles} className="w-full bg-gray-50 dark:bg-gray-900">
          {/* Header Dinâmico */}
          <header 
            className="relative h-32 bg-cover bg-center flex items-end p-3"
            style={{ 
              backgroundImage: data.banner_url ? `url(${data.banner_url})` : `linear-gradient(135deg, var(--public-secondary), var(--public-primary))`,
              backgroundColor: data.secondary_color_hex,
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 text-white flex items-center gap-3">
              {data.logo_url ? (
                <img src={data.logo_url} alt="Logo" className="h-10 w-10 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border-2 border-white">
                  <Scissors className="h-5 w-5 text-gray-800" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold leading-tight">{data.company_name || 'Nome da Barbearia'}</h3>
                {data.slogan && <p className="text-xs font-medium opacity-90">{data.slogan}</p>}
              </div>
            </div>
          </header>

          {/* Informações de Contato */}
          <div className="p-3 bg-card border-t">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="flex flex-col items-center">
                <MapPin className="h-3.5 w-3.5 mb-0.5" style={{ color: data.primary_color_hex }} />
                <span className="text-[10px] text-muted-foreground line-clamp-2">{data.address || 'Endereço'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="h-3.5 w-3.5 mb-0.5" style={{ color: data.primary_color_hex }} />
                <span className="text-[10px] text-muted-foreground">{data.phone || 'Telefone'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="h-3.5 w-3.5 mb-0.5" style={{ color: data.primary_color_hex }} />
                <span className="text-[10px] text-muted-foreground line-clamp-1">{data.email || 'Email'}</span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          {hasSocialMedia && (
            <div className="flex justify-center gap-3 py-2 border-t bg-card">
              {data.instagram_url && (
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${data.primary_color_hex}20` }}
                >
                  <Instagram className="h-3.5 w-3.5" style={{ color: data.primary_color_hex }} />
                </div>
              )}
              {data.facebook_url && (
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${data.primary_color_hex}20` }}
                >
                  <Facebook className="h-3.5 w-3.5" style={{ color: data.primary_color_hex }} />
                </div>
              )}
              {data.whatsapp_number && (
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${data.primary_color_hex}20` }}
                >
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: data.primary_color_hex }} />
                </div>
              )}
            </div>
          )}

          {/* Simulação de Serviços */}
          <div className="p-3 border-t bg-card">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Scissors className="h-3 w-3" style={{ color: data.primary_color_hex }} />
              Nossos Serviços
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] p-1.5 rounded bg-muted/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.primary_color_hex }}></div>
                  <span className="text-foreground">Corte Masculino</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> 30min
                  </span>
                  <span className="font-semibold" style={{ color: data.primary_color_hex }}>R$ 35</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] p-1.5 rounded bg-muted/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.primary_color_hex }}></div>
                  <span className="text-foreground">Barba</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> 20min
                  </span>
                  <span className="font-semibold" style={{ color: data.primary_color_hex }}>R$ 25</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] p-1.5 rounded bg-muted/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.primary_color_hex }}></div>
                  <span className="text-foreground">Corte + Barba</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> 50min
                  </span>
                  <span className="font-semibold" style={{ color: data.primary_color_hex }}>R$ 55</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simulação de Profissionais */}
          <div className="p-3 border-t bg-card">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <User className="h-3 w-3" style={{ color: data.primary_color_hex }} />
              Profissionais
            </h4>
            <div className="flex gap-2">
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{ borderColor: data.primary_color_hex, backgroundColor: `${data.primary_color_hex}10` }}
                >
                  <User className="h-4 w-4" style={{ color: data.primary_color_hex }} />
                </div>
                <span className="text-[9px] text-muted-foreground">João</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{ borderColor: data.primary_color_hex, backgroundColor: `${data.primary_color_hex}10` }}
                >
                  <User className="h-4 w-4" style={{ color: data.primary_color_hex }} />
                </div>
                <span className="text-[9px] text-muted-foreground">Pedro</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{ borderColor: data.primary_color_hex, backgroundColor: `${data.primary_color_hex}10` }}
                >
                  <User className="h-4 w-4" style={{ color: data.primary_color_hex }} />
                </div>
                <span className="text-[9px] text-muted-foreground">Carlos</span>
              </div>
            </div>
          </div>
          
          {/* Botão de Agendamento */}
          <div className="p-3 border-t">
            <button 
              className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 shadow-md"
              style={{ backgroundColor: data.primary_color_hex }}
            >
              Agendar Agora
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyPagePreview;
