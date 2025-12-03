import React from 'react';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface CalendarEventCardProps {
    appointment: Appointment;
    onClick: (appointment: Appointment) => void;
    style?: React.CSSProperties;
    barberColor?: string;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent, appointment: Appointment) => void;
    onDragEnd?: () => void;
}

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ 
    appointment, 
    onClick, 
    style, 
    barberColor,
    draggable = false,
    onDragStart,
    onDragEnd
}) => {
    const getStatusIndicator = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-emerald-400';
            case 'completed':
                return 'bg-blue-400';
            case 'cancelled':
                return 'bg-red-400';
            default: // pending
                return 'bg-amber-400';
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        if (onDragStart) {
            onDragStart(e, appointment);
        }
        e.dataTransfer.setData('appointmentId', appointment.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const bgColor = barberColor || 'hsl(var(--primary))';

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick(appointment);
            }}
            style={{
                ...style,
                backgroundColor: bgColor,
            }}
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            className={cn(
                "absolute rounded-md cursor-pointer transition-all text-[11px] leading-tight overflow-hidden px-1.5 py-1 text-white",
                draggable && "hover:shadow-lg active:opacity-70 active:cursor-grabbing",
                appointment.status === 'cancelled' && "opacity-60"
            )}
        >
            <div className="flex items-center gap-1">
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", getStatusIndicator(appointment.status))} />
                <span className="font-semibold truncate">
                    {appointment.clients?.name || 'Cliente'}
                </span>
            </div>
            <div className="truncate opacity-90">
                {appointment.services?.name || 'Serviço'}
            </div>
        </div>
    );
};

export default CalendarEventCard;
