import React from 'react';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface CalendarEventCardProps {
    appointment: Appointment;
    onClick: (appointment: Appointment) => void;
    style?: React.CSSProperties;
}

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ appointment, onClick, style }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-emerald-500/90 hover:bg-emerald-500 text-white border-l-emerald-700';
            case 'completed':
                return 'bg-blue-500/90 hover:bg-blue-500 text-white border-l-blue-700';
            case 'cancelled':
                return 'bg-red-400/90 hover:bg-red-400 text-white border-l-red-600 opacity-60';
            default: // pending
                return 'bg-amber-500/90 hover:bg-amber-500 text-white border-l-amber-700';
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
                "absolute rounded-md cursor-pointer transition-all text-[11px] leading-tight overflow-hidden border-l-4 px-1.5 py-1",
                getStatusStyles(appointment.status)
            )}
        >
            <div className="font-semibold truncate">
                {appointment.clients?.name || 'Cliente'}
            </div>
            <div className="truncate opacity-90">
                {appointment.services?.name || 'Serviço'}
            </div>
        </div>
    );
};

export default CalendarEventCard;
