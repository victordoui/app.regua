import React, { useState } from 'react';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';
import { Repeat, Sparkles, Clock, User, Scissors, CheckCircle2, Edit2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    onConfirm?: (id: string) => void;
}

// Generate a pastel background from a solid color
const getPastelBg = (color: string): string => {
    // Extract hue from hsl or return a default pastel
    const hslMatch = color.match(/hsl\((\d+)/);
    if (hslMatch) {
        const hue = hslMatch[1];
        return `hsl(${hue}, 85%, 93%)`;
    }
    // Fallback pastels based on common hex colors
    if (color.includes('#')) return `${color}18`;
    return 'hsl(var(--primary) / 0.12)';
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'confirmed':
            return { label: 'CONFIRMADO', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        case 'completed':
            return { label: 'CONCLUÍDO', className: 'bg-blue-100 text-blue-700 border-blue-200' };
        case 'cancelled':
            return { label: 'CANCELADO', className: 'bg-red-100 text-red-700 border-red-200' };
        case 'no_show':
            return { label: 'NÃO COMPARECEU', className: 'bg-gray-100 text-gray-700 border-gray-200' };
        default:
            return { label: 'PENDENTE', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
};

const getAppointmentNumber = (id: string) => {
    // Use last 4 chars of UUID as a short ID
    return `#${id.slice(-4).toUpperCase()}`;
};

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ 
    appointment, 
    onClick, 
    style, 
    barberColor,
    draggable = false,
    onDragStart,
    onDragEnd,
    onConfirm
}) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        if (onDragStart) {
            onDragStart(e, appointment);
        }
        e.dataTransfer.setData('appointmentId', appointment.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const solidColor = barberColor || 'hsl(var(--primary))';
    const pastelBg = getPastelBg(solidColor);
    
    const isRecurring = appointment.recurrence_type || appointment.parent_appointment_id;
    const isNew = appointment.created_at 
        ? differenceInHours(new Date(), parseISO(appointment.created_at)) < 24 
        : false;
    
    const statusBadge = getStatusBadge(appointment.status);
    const shortId = getAppointmentNumber(appointment.id);

    const barberInitial = appointment.barbers?.full_name 
        ? appointment.barbers.full_name.charAt(0).toUpperCase() 
        : '?';

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setPopoverOpen(true);
                    }}
                    style={{
                        ...style,
                        backgroundColor: pastelBg,
                        borderLeft: `4px solid ${solidColor}`,
                    }}
                    draggable={draggable}
                    onDragStart={handleDragStart}
                    onDragEnd={onDragEnd}
                    className={cn(
                        "absolute rounded-r-md cursor-pointer transition-all text-[11px] leading-tight overflow-hidden px-1.5 py-1",
                        "hover:shadow-md hover:brightness-95",
                        draggable && "active:opacity-70 active:cursor-grabbing",
                        appointment.status === 'cancelled' && "opacity-50"
                    )}
                >
                    <div className="flex items-start justify-between gap-0.5">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] font-medium text-muted-foreground">{shortId}</span>
                                {isNew && (
                                    <span className="inline-flex items-center gap-0.5 px-1 rounded text-[8px] font-bold bg-amber-400 text-amber-900 animate-pulse">
                                        <Sparkles className="w-2 h-2" />
                                        NOVO
                                    </span>
                                )}
                                {isRecurring && (
                                    <Repeat className="w-2.5 h-2.5 flex-shrink-0 text-muted-foreground" />
                                )}
                            </div>
                            <p className="font-semibold truncate text-foreground">
                                {appointment.clients?.name || 'Cliente'}
                            </p>
                            <p className="truncate font-medium" style={{ color: solidColor }}>
                                {appointment.services?.name || 'Serviço'}
                            </p>
                        </div>
                        {/* Barber avatar */}
                        <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: solidColor }}
                            title={appointment.barbers?.full_name || 'Barbeiro'}
                        >
                            {barberInitial}
                        </div>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent 
                side="right" 
                align="start" 
                className="w-72 p-0 rounded-xl shadow-xl border"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* Popover Header */}
                <div className="p-4 pb-3 border-b">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: solidColor }}
                        >
                            {(appointment.clients?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                                {appointment.clients?.name || 'Cliente'}
                            </p>
                            <p className="text-xs text-muted-foreground">{shortId}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-semibold border", statusBadge.className)}>
                            {statusBadge.label}
                        </Badge>
                    </div>
                </div>

                {/* Popover Details */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Scissors className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium" style={{ color: solidColor }}>
                            {appointment.services?.name || 'Serviço'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                            {format(parseISO(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })} às {appointment.appointment_time}
                        </span>
                    </div>

                    {appointment.barbers?.full_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{appointment.barbers.full_name}</span>
                        </div>
                    )}

                    {appointment.total_price != null && (
                        <div className="text-sm font-semibold text-foreground">
                            R$ {appointment.total_price.toFixed(2)}
                        </div>
                    )}
                </div>

                {/* Popover Actions */}
                <div className="p-3 border-t flex gap-2">
                    {appointment.status === 'pending' && (
                        <Button 
                            size="sm" 
                            className="flex-1 gap-1.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopoverOpen(false);
                                onConfirm?.(appointment.id);
                            }}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmar
                        </Button>
                    )}
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-1.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPopoverOpen(false);
                            onClick(appointment);
                        }}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default CalendarEventCard;
