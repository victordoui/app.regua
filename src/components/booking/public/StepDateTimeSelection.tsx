import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClientBookingForm, PublicTimeSlot } from '@/types/publicBooking';
import { isBefore, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface StepDateTimeSelectionProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  timeSlots: PublicTimeSlot[];
  loading: boolean;
  totalDuration: number;
}

const StepDateTimeSelection: React.FC<StepDateTimeSelectionProps> = ({ formData, setFormData, timeSlots, loading, totalDuration }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        Duração total dos serviços: <span className="font-semibold text-foreground">{totalDuration} minutos</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <Label className="text-base font-medium mb-2 block">Selecione a Data</Label>
          <Calendar
            mode="single"
            selected={formData.selectedDate}
            onSelect={(date) => setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: "" }))}
            disabled={(date) => 
              isBefore(date, today) || 
              date.getDay() === 0 // Domingo
            }
            className="rounded-md border w-full"
            locale={ptBR}
          />
        </div>

        {/* Time Slots */}
        <div>
          <Label className="text-base font-medium mb-2 block">Horários Disponíveis</Label>
          {!formData.selectedDate ? (
            <div className="text-center py-10 text-muted-foreground">Selecione uma data no calendário.</div>
          ) : loading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando horários...</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
              {timeSlots.filter(slot => slot.available).map((slot) => (
                <Button
                  key={slot.time}
                  variant={formData.selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, selectedTime: slot.time }))}
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