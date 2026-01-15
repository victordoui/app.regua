import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { WaitlistItem } from '@/hooks/useWaitlist';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Barber {
  id: string;
  full_name: string;
}

interface ConvertToAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waitlistItem: WaitlistItem | null;
  services: Service[];
  barbers: Barber[];
  onConfirm: (data: {
    service_id: string;
    barbeiro_id: string;
    appointment_date: string;
    appointment_time: string;
  }) => void;
  isLoading?: boolean;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const ConvertToAppointmentDialog: React.FC<ConvertToAppointmentDialogProps> = ({
  open,
  onOpenChange,
  waitlistItem,
  services,
  barbers,
  onConfirm,
  isLoading
}) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Pre-fill from waitlist item
  useEffect(() => {
    if (waitlistItem) {
      if (waitlistItem.service_id) setSelectedService(waitlistItem.service_id);
      if (waitlistItem.barber_id) setSelectedBarber(waitlistItem.barber_id);
      if (waitlistItem.preferred_date) setSelectedDate(new Date(waitlistItem.preferred_date));
      if (waitlistItem.preferred_time_start) setSelectedTime(waitlistItem.preferred_time_start);
    }
  }, [waitlistItem]);

  const handleConfirm = () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    
    onConfirm({
      service_id: selectedService,
      barbeiro_id: selectedBarber,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime
    });
  };

  const isValid = selectedService && selectedBarber && selectedDate && selectedTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Converter em Agendamento</DialogTitle>
        </DialogHeader>

        {waitlistItem && (
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="font-medium">{waitlistItem.client_name}</p>
            <p className="text-sm text-muted-foreground">{waitlistItem.client_phone}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label>Serviço *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toFixed(2)} ({service.duration_minutes}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Barber Selection */}
          <div className="space-y-2">
            <Label>Barbeiro *</Label>
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o barbeiro" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map(barber => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Horário *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToAppointmentDialog;
