import React from 'react';
import { format } from "date-fns";
import { Appointment, BarberData, TimeSlot } from '@/types/appointments';

interface AppointmentListAndSlotsProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onUpdateStatus: (appointment: Appointment, newStatus: string) => void;
}

const AppointmentListAndSlots: React.FC<AppointmentListAndSlotsProps> = ({
  appointments,
  onEdit,
  onDelete,
  onUpdateStatus
}) => {
  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{appointment.clients?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {appointment.services?.name} - {format(new Date(appointment.appointment_date), 'dd/MM/yyyy')} às {appointment.appointment_time}
          </p>
          <p className="text-sm">Status: {appointment.status}</p>
        </div>
      ))}
    </div>
  );
};

export default AppointmentListAndSlots;