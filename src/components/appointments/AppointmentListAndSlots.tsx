import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Barber, TimeSlot } from '@/types/appointments';
import AppointmentCard from './AppointmentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';

interface AppointmentListAndSlotsProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => void;
  selectedDate: Date | undefined;
  onTimeSlotClick: (time: string) => void;
  barbers: Barber[];
}

const generateTimeSlots = (date: Date, barbers: Barber[], appointments: Appointment[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 18; // Until 18:00 for 17:30 appointments
  const interval = 30; // minutes

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = format(new Date(date.setHours(hour, minute, 0, 0)), 'HH:mm');
      
      // Check availability for each barber
      const availableBarbers = barbers.filter(barber => {
        const isBarberBusy = appointments.some(apt => 
          apt.barbeiro_id === barber.id && apt.appointment_time === time && apt.status !== 'cancelled'
        );
        return !isBarberBusy;
      });

      slots.push({
        time,
        available: availableBarbers.length > 0,
        barberId: availableBarbers.length > 0 ? availableBarbers[0].id : undefined, // Assign first available barber
        conflictReason: availableBarbers.length === 0 ? 'Todos os barbeiros ocupados' : undefined,
      });
    }
  }
  return slots;
};


const AppointmentListAndSlots: React.FC<AppointmentListAndSlotsProps> = ({
  appointments,
  onEdit,
  onDelete,
  onUpdateStatus,
  selectedDate,
  onTimeSlotClick,
  barbers,
}) => {
  const today = new Date();
  const isToday = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const isPastDate = selectedDate && selectedDate < today && !isToday;

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate, barbers, appointments) : [];

  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = parseInt(a.appointment_time.replace(':', ''));
    const timeB = parseInt(b.appointment_time.replace(':', ''));
    return timeA - timeB;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={slot.available && !isPastDate ? "default" : "outline"}
                  className="h-10 text-sm"
                  onClick={() => onTimeSlotClick(slot.time)}
                  disabled={!slot.available || isPastDate}
                >
                  {slot.time}
                </Button>
              ))}
              {timeSlots.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">Nenhum horário disponível.</p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Selecione uma data no calendário.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos para {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'hoje'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum agendamento para esta data.
              </div>
            ) : (
              sortedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentListAndSlots;