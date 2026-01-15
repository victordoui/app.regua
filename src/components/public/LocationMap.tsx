import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Phone, Mail } from 'lucide-react';

interface LocationMapProps {
  address: string | null;
  phone: string | null;
  email: string | null;
  latitude?: number;
  longitude?: number;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  address, 
  phone, 
  email,
  latitude,
  longitude 
}) => {
  const handleOpenMaps = () => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone.replace(/\D/g, '')}`;
    }
  };

  const handleEmail = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  // Generate Google Maps embed URL
  const getMapEmbedUrl = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1spt-BR!2sbr!4v1234567890`;
    }
    if (address) {
      return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(address)}`;
    }
    return null;
  };

  if (!address && !phone && !email) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-3">
          {address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{address}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={handleOpenMaps}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Abrir no Google Maps
                </Button>
              </div>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{phone}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={handleCall}
                >
                  Ligar agora
                </Button>
              </div>
            </div>
          )}

          {email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{email}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={handleEmail}
                >
                  Enviar email
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Map Placeholder */}
        {address && (
          <div 
            className="relative w-full h-[200px] rounded-lg overflow-hidden bg-muted cursor-pointer"
            onClick={handleOpenMaps}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <MapPin className="h-12 w-12 mb-2" />
              <p className="text-sm font-medium">Clique para ver no mapa</p>
            </div>
            {/* Would be replaced with actual Google Maps iframe with valid API key */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMap;
