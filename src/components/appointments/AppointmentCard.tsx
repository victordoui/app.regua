import React from 'react';
import { Edit, Trash2, Check, X, Phone, User, Clock } from 'lucide-react';
import { Appointment } from '@/types/appointments';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onUpdateStatus: (appointment: Appointment, newStatus: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onDelete, onUpdateStatus }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{appointment.clients?.name}</h3>
          <p className="text-sm text-muted-foreground">{appointment.services?.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{appointment.appointment_time}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(appointment)} className="p-1">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(appointment)} className="p-1">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;