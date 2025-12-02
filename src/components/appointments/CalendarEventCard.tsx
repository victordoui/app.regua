import React from 'react';
import { Appointment } from '@/types/appointments';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Clock, User, Scissors } from 'lucide-react';

interface CalendarEventCardProps {
    appointment: Appointment;
    onClick: (appointment: Appointment) => void;
    style?: React.CSSProperties;
}

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ appointment, onClick, style }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        }
    };

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick(appointment);
            }}
            style={style}
            className={cn(
                "absolute p-2 rounded-md border text-xs cursor-pointer hover:brightness-95 transition-all shadow-sm overflow-hidden flex flex-col gap-1",
                getStatusColor(appointment.status)
            )}
        >
            <div className="font-semibold truncate flex items-center gap-1">
                <User className="h-3 w-3" />
                {appointment.clients?.name || 'Cliente Desconhecido'}
            </div>
            <div className="truncate flex items-center gap-1 opacity-90">
                <Scissors className="h-3 w-3" />
                {appointment.services?.name || 'Serviço'}
            </div>
            <div className="truncate flex items-center gap-1 opacity-75">
                <Clock className="h-3 w-3" />
                {appointment.appointment_time}
            </div>
        </div>
    );
};

export default CalendarEventCard;
