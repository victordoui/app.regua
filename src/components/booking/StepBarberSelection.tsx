import React from 'react';
import { User } from 'lucide-react';
import { Barber, BookingForm } from '@/types/booking';

interface StepBarberSelectionProps {
  barbers: Barber[];
  bookingForm: BookingForm;
  setBookingForm: React.Dispatch<React.SetStateAction<BookingForm>>;
}

const StepBarberSelection: React.FC<StepBarberSelectionProps> = ({ barbers, bookingForm, setBookingForm }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">2. Escolha o Barbeiro</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              bookingForm.selectedBarber === barber.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBookingForm(prev => ({ ...prev, selectedBarber: barber.id, selectedTime: "" }))}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold">{barber.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {barber.specialties?.join(', ') || 'Especialista em cortes'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepBarberSelection;