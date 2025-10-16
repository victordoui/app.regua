import React from 'react';
import { Service, BookingForm } from '@/types/booking';

interface StepServiceSelectionProps {
  services: Service[];
  bookingForm: BookingForm;
  setBookingForm: React.Dispatch<React.SetStateAction<BookingForm>>;
}

const StepServiceSelection: React.FC<StepServiceSelectionProps> = ({ services, bookingForm, setBookingForm }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">1. Escolha o Serviço</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              bookingForm.selectedService === service.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBookingForm(prev => ({ ...prev, selectedService: service.id }))}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Duração: {service.duration_minutes} min
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">R$ {service.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepServiceSelection;