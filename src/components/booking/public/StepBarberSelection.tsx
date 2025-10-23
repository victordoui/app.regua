import React from 'react';
import { User, Scissors } from 'lucide-react';
import { ClientBookingForm, PublicBarber } from '@/types/publicBooking';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StepBarberSelectionProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  barbers: PublicBarber[];
}

const StepBarberSelection: React.FC<StepBarberSelectionProps> = ({ formData, setFormData, barbers }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              formData.selectedBarber === barber.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, selectedBarber: barber.id, selectedDate: undefined, selectedTime: '' }))}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {barber.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{barber.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {barber.specialties?.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepBarberSelection;