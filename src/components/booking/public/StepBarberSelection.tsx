import React from 'react';
import { Heart } from 'lucide-react';
import { ClientBookingForm, PublicBarber } from '@/types/publicBooking';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavoriteBarbers } from '@/hooks/useFavoriteBarbers';

interface StepBarberSelectionProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  barbers: PublicBarber[];
  clientProfileId?: string | null;
  barbershopUserId?: string | null;
}

const StepBarberSelection: React.FC<StepBarberSelectionProps> = ({ 
  formData, 
  setFormData, 
  barbers,
  clientProfileId,
  barbershopUserId,
}) => {
  const { isFavorite, toggleFavorite } = useFavoriteBarbers(clientProfileId || null, barbershopUserId || null);

  // Sort barbers: favorites first
  const sortedBarbers = [...barbers].sort((a, b) => {
    const aFav = isFavorite(a.id) ? 1 : 0;
    const bFav = isFavorite(b.id) ? 1 : 0;
    return bFav - aFav;
  });

  const handleFavoriteClick = (e: React.MouseEvent, barberId: string) => {
    e.stopPropagation();
    if (clientProfileId) {
      toggleFavorite(barberId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedBarbers.map((barber) => {
          const isFav = isFavorite(barber.id);
          
          return (
            <div
              key={barber.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md relative ${
                formData.selectedBarber === barber.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, selectedBarber: barber.id, selectedDate: undefined, selectedTime: '' }))}
            >
              {/* Favorite Badge */}
              {isFav && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                  ❤️ Favorito
                </Badge>
              )}
              
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {barber.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{barber.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {barber.specialties?.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Favorite Button */}
                {clientProfileId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={(e) => handleFavoriteClick(e, barber.id)}
                  >
                    <Heart 
                      className={`h-5 w-5 transition-colors ${
                        isFav 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground hover:text-red-500'
                      }`} 
                    />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepBarberSelection;
