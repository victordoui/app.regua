import React from 'react';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';
import { Repeat, Sparkles } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    
    const isRecurring = appointment.recurrence_type || appointment.parent_appointment_id;
    
    // Check if appointment was created within last 24 hours
    const isNew = appointment.created_at 
        ? differenceInHours(new Date(), parseISO(appointment.created_at)) < 24 
        : false;
    
    const getRecurrenceLabel = (type: string | null | undefined) => {
        switch (type) {
            case 'weekly': return 'Semanal';
            case 'biweekly': return 'Quinzenal';
            case 'monthly': return 'Mensal';
            default: return 'Parte de série';
        }
    };

    const formatCreatedAt = () => {
        if (!appointment.created_at) return null;
        const createdDate = parseISO(appointment.created_at);
        return format(createdDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    };

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
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
                            {isNew && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-amber-900 animate-pulse">
                                    <Sparkles className="w-2 h-2" />
                                    NOVO
                                </span>
                            )}
                            {isRecurring && (
                                <Repeat className="w-3 h-3 flex-shrink-0 opacity-80" />
                            )}
                            <span className="font-semibold truncate">
                                {appointment.clients?.name || 'Cliente'}
                            </span>
                        </div>
                        <div className="truncate opacity-90">
                            {appointment.services?.name || 'Serviço'}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-1 text-sm">
                        <p className="font-semibold">{appointment.clients?.name || 'Cliente'}</p>
                        <p className="text-muted-foreground">{appointment.services?.name || 'Serviço'}</p>
                        <p className="text-muted-foreground">
                            {format(parseISO(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })} às {appointment.appointment_time}
                        </p>
                        {appointment.barbers?.full_name && (
                            <p className="text-muted-foreground">Barbeiro: {appointment.barbers.full_name}</p>
                        )}
                        {isRecurring && (
                            <p className="text-primary text-xs flex items-center gap-1">
                                <Repeat className="w-3 h-3" />
                                {getRecurrenceLabel(appointment.recurrence_type)}
                            </p>
                        )}
                        <div className="border-t pt-1 mt-1">
                            <p className="text-xs text-muted-foreground">
                                📅 Agendado em: {formatCreatedAt() || 'Data não disponível'}
                            </p>
                            {isNew && (
                                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Agendamento recente (últimas 24h)
                                </p>
                            )}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default CalendarEventCard;
