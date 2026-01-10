import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ClientBookingForm, PublicService } from '@/types/publicBooking';
import { Clock, DollarSign, Scissors } from 'lucide-react';

interface StepServiceSelectionProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  services: PublicService[];
}

const StepServiceSelection: React.FC<StepServiceSelectionProps> = ({ formData, setFormData, services }) => {
  const handleToggleService = (serviceId: string) => {
    setFormData(prev => {
      const currentServices = prev.selectedServices;
      if (currentServices.includes(serviceId)) {
        return { ...prev, selectedServices: currentServices.filter(id => id !== serviceId) };
      } else {
        return { ...prev, selectedServices: [...currentServices, serviceId] };
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => {
          const isSelected = formData.selectedServices.includes(service.id);
          return (
            <div
              key={service.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleToggleService(service.id)}
            >
              <div className="flex items-start gap-4">
                {/* Imagem do serviço */}
                {service.image_url ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Scissors className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <Checkbox
                  id={service.id}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleService(service.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <Label htmlFor={service.id} className="font-semibold text-base cursor-pointer">
                    {service.name}
                  </Label>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {service.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepServiceSelection;