import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TimeSlot, BookingForm } from '@/types/booking';
import { isBefore } from 'date-fns';

interface StepDateTimeSelectionProps {
  bookingForm: BookingForm;
  setBookingForm: React.Dispatch<React.SetStateAction<BookingForm>>;
  timeSlots: TimeSlot[];
  loading: boolean;
}

const StepDateTimeSelection: React.FC<StepDateTimeSelectionProps> = ({ bookingForm, setBookingForm, timeSlots, loading }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">3. Data e Horário</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <Label className="text-base font-medium mb-2 block">Selecione a Data</Label>
          <Calendar
            mode="single"
            selected={bookingForm.selectedDate}
            onSelect={(date) => setBookingForm(prev => ({ ...prev, selectedDate: date, selectedTime: "" }))}
            disabled={(date) => 
              isBefore(date, new Date()) || 
              date.getDay() === 0 // Domingo
            }
            className="rounded-md border w-full"
          />
        </div>

        {/* Time Slots */}
        <div>
          <Label className="text-base font-medium mb-2 block">Horários Disponíveis</Label>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando horários...</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
              {timeSlots.filter(slot => slot.available).map((slot) => (
                <Button
                  key={slot.time}
                  variant={bookingForm.selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookingForm(prev => ({ ...prev, selectedTime: slot.time }))}
                  className="text-sm"
                >
                  {slot.time}
                </Button>
              ))}
              {timeSlots.filter(slot => slot.available).length === 0 && (
                <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">
                  Nenhum horário disponível para esta data/barbeiro.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepDateTimeSelection;