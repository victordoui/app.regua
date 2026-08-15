import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/appointments';
import CalendarEventCard from './CalendarEventCard';
import MonthView from './MonthView';
import DragPreview from './DragPreview';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarViewProps {
    appointments: Appointment[];
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onTimeSlotClick: (date: Date, time: string) => void;
    onEventClick: (appointment: Appointment) => void;
    viewMode?: 'week' | 'day' | 'month';
    onViewModeChange?: (mode: 'week' | 'day' | 'month') => void;
    barberColorMap: Map<string, string>;
    onAppointmentMove?: (appointmentId: string, newDate: string, newTime: string) => void;
}

/**
 * Datas de agendamento são armazenadas no banco como `YYYY-MM-DD`, sem fuso.
 * Comparar `new Date('YYYY-MM-DD')` desloca a data para o dia anterior em
 * fusos negativos (como America/Sao_Paulo), então a comparação deve ser feita
 * pela chave civil da data, sem convertê-la para UTC.
 */
const isAppointmentOnCalendarDay = (appointmentDate: string, day: Date) =>
    appointmentDate.slice(0, 10) === format(day, 'yyyy-MM-dd');

const CalendarView: React.FC<CalendarViewProps> = ({
    appointments,
    selectedDate,
    onDateChange,
    onTimeSlotClick,
    onEventClick,
    viewMode = 'week',
    onViewModeChange,
    barberColorMap,
    onAppointmentMove
}) => {
    const [currentViewMode, setCurrentViewMode] = useState<'week' | 'day' | 'month'>(viewMode);
    const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
    const [draggingAppointment, setDraggingAppointment] = useState<Appointment | null>(null);
    const [previewPosition, setPreviewPosition] = useState<{ date: Date; hour: number } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (onViewModeChange) {
            setCurrentViewMode(viewMode);
        }
    }, [viewMode, onViewModeChange]);

    useEffect(() => {
        if (isMobile && currentViewMode === 'week') {
            setCurrentViewMode('day');
            onViewModeChange?.('day');
        }
    }, [isMobile, currentViewMode, onViewModeChange]);

    useLayoutEffect(() => {
        if (scrollRef.current && currentViewMode !== 'month') {
            const hourHeight = 48;
            const scrollTo = 7 * hourHeight;
            const frame = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (scrollRef.current) scrollRef.current.scrollTop = scrollTo;
                });
            });
            return () => cancelAnimationFrame(frame);
        }
    }, [currentViewMode, selectedDate]);

    const handlePrevious = () => {
        if (currentViewMode === 'month') {
            onDateChange(subMonths(selectedDate, 1));
        } else if (currentViewMode === 'week') {
            onDateChange(subWeeks(selectedDate, 1));
        } else {
            onDateChange(addDays(selectedDate, -1));
        }
    };

    const handleNext = () => {
        if (currentViewMode === 'month') {
            onDateChange(addMonths(selectedDate, 1));
        } else if (currentViewMode === 'week') {
            onDateChange(addWeeks(selectedDate, 1));
        } else {
            onDateChange(addDays(selectedDate, 1));
        }
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const handleViewModeChange = (mode: 'week' | 'day' | 'month') => {
        setCurrentViewMode(mode);
        onViewModeChange?.(mode);
    };

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });

    const days = currentViewMode === 'week'
        ? eachDayOfInterval({ start: weekStart, end: weekEnd })
        : [selectedDate];

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter(apt => isAppointmentOnCalendarDay(apt.appointment_date, day));
    };

    const getEventStyle = (appointment: Appointment) => {
        const [hour, minute] = appointment.appointment_time.split(':').map(Number);
        const startMinutes = hour * 60 + minute;
        const duration = appointment.services?.duration_minutes || 30;

        const pixelsPerMinute = 48 / 60;
        const top = startMinutes * pixelsPerMinute;
        const height = Math.max(duration * pixelsPerMinute, 20);

        return {
            top: `${top}px`,
            height: `${height}px`,
            left: '2px',
            right: '2px',
        };
    };

    const getBarberColor = (barberId: string | null) => {
        if (!barberId) return 'hsl(var(--primary))';
        return barberColorMap.get(barberId) || 'hsl(var(--primary))';
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
        e.dataTransfer.setData('appointmentId', appointment.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggingAppointment(appointment);
    };

    const handleDragOver = (e: React.DragEvent, slotKey: string, day: Date, hour: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverSlot(slotKey);
        setPreviewPosition({ date: day, hour });
    };

    const handleDragLeave = () => {
        setDragOverSlot(null);
        setPreviewPosition(null);
    };

    const handleDragEnd = () => {
        setDraggingAppointment(null);
        setPreviewPosition(null);
        setDragOverSlot(null);
    };

    const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
        e.preventDefault();
        setDragOverSlot(null);
        setPreviewPosition(null);
        setDraggingAppointment(null);
        
        const appointmentId = e.dataTransfer.getData('appointmentId');
        if (appointmentId && onAppointmentMove) {
            const newDate = format(day, 'yyyy-MM-dd');
            const newTime = `${hour.toString().padStart(2, '0')}:00`;
            onAppointmentMove(appointmentId, newDate, newTime);
        }
    };

    const handleMonthDayClick = (day: Date) => {
        onDateChange(day);
        handleViewModeChange('day');
    };

    // Get preview style for drag preview
    const getPreviewStyle = (day: Date, hour: number) => {
        const pixelsPerMinute = 48 / 60;
        const top = hour * 60 * pixelsPerMinute;
        return {
            top: `${top}px`,
            left: '2px',
            right: '2px',
        };
    };

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Header - Estilo Google Calendar */}
            <div className="flex flex-col gap-2 border-b bg-card px-2.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleToday}
                        className="min-h-10 rounded-lg px-3 text-sm font-bold"
                    >
                        Hoje
                    </Button>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-10 w-10" aria-label="Período anterior">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext} className="h-10 w-10" aria-label="Próximo período">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="ml-1 min-w-0 truncate text-base font-bold capitalize sm:ml-2 sm:text-lg">
                        {format(selectedDate, isMobile && currentViewMode === 'day' ? "EEE, d 'de' MMM" : 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                </div>

                <div className={cn("grid rounded-xl bg-muted p-1", isMobile ? "grid-cols-2" : "grid-cols-3")}>
                    <button
                        className={cn(
                            "min-h-9 px-3 py-1.5 text-sm rounded-lg transition-all font-bold",
                            currentViewMode === 'day' 
                                ? "bg-background shadow-sm text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleViewModeChange('day')}
                    >
                        Dia
                    </button>
                    {!isMobile && <button
                        className={cn(
                            "min-h-9 px-3 py-1.5 text-sm rounded-lg transition-all font-bold",
                            currentViewMode === 'week' 
                                ? "bg-background shadow-sm text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleViewModeChange('week')}
                    >
                        Semana
                    </button>}
                    <button
                        className={cn(
                            "min-h-9 px-3 py-1.5 text-sm rounded-lg transition-all font-bold",
                            currentViewMode === 'month' 
                                ? "bg-background shadow-sm text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleViewModeChange('month')}
                    >
                        Mês
                    </button>
                </div>
            </div>

            {/* Month View */}
            {currentViewMode === 'month' ? (
                <div className="flex-1 overflow-auto">
                    <MonthView
                        appointments={appointments}
                        selectedDate={selectedDate}
                        onDateClick={handleMonthDayClick}
                        onEventClick={onEventClick}
                        barberColorMap={barberColorMap}
                    />
                </div>
            ) : (
                /* Day/Week View */
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Days Columns */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {/* Days Header */}
                        <div className="flex h-11 flex-shrink-0 border-b bg-muted/20">
                            <div className="w-12 flex-shrink-0 border-r sm:w-14" />
                            {days.map(day => (
                                <button
                                    key={day.toString()}
                                    type="button"
                                    className="flex min-w-0 flex-1 flex-col items-center justify-center border-r px-1 transition-colors last:border-r-0 hover:bg-muted/60"
                                    onClick={() => {
                                        onDateChange(day);
                                        handleViewModeChange('day');
                                    }}
                                    aria-label={`Abrir agenda de ${format(day, "d 'de' MMMM", { locale: ptBR })}`}
                                >
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wide",
                                        isToday(day) ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {format(day, 'EEE', { locale: ptBR })}
                                    </span>
                                    <span className={cn(
                                        "mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-sm font-bold leading-none",
                                        isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Days Grid Scrollable Area */}
                        <div className="flex-1 overflow-auto overscroll-contain" ref={scrollRef}>
                            <div className="relative flex" style={{ height: '1152px' }}>
                                <div className="sticky left-0 z-30 w-12 flex-shrink-0 border-r bg-card sm:w-14">
                                    {hours.map(hour => (
                                        <div
                                            key={hour}
                                            className="absolute w-full -translate-y-1/2 pr-2 text-right text-[10px] font-medium text-muted-foreground"
                                            style={{ top: `${hour * 48}px` }}
                                        >
                                            {hour.toString().padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>

                                <div className="relative flex min-w-0 flex-1">
                                {/* Hour Lines */}
                                <div className="pointer-events-none absolute inset-0 w-full">
                                    {hours.map(hour => (
                                        <div
                                            key={hour}
                                            className="absolute w-full border-b border-border/55"
                                            style={{ top: `${hour * 48}px`, height: '48px' }}
                                        />
                                    ))}
                                </div>

                                {days.map(day => (
                                    <div key={day.toString()} className="relative min-w-0 flex-1 border-r last:border-r-0">
                                        {/* Clickable/Droppable Slots */}
                                        {hours.map(hour => {
                                            const slotKey = `${format(day, 'yyyy-MM-dd')}-${hour}`;
                                            const isDragOver = dragOverSlot === slotKey;
                                            
                                            return (
                                                <div
                                                    key={hour}
                                                    className={cn(
                                                        "h-12 w-full hover:bg-primary/5 transition-colors cursor-pointer",
                                                        isDragOver && "bg-primary/10 border-2 border-dashed border-primary"
                                                    )}
                                                    onClick={() => onTimeSlotClick(day, `${hour.toString().padStart(2, '0')}:00`)}
                                                    onDragOver={(e) => handleDragOver(e, slotKey, day, hour)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, day, hour)}
                                                />
                                            );
                                        })}

                                        {/* Events */}
                                        {getAppointmentsForDay(day).map(apt => (
                                            <CalendarEventCard
                                                key={apt.id}
                                                appointment={apt}
                                                onClick={onEventClick}
                                                style={{
                                                    ...getEventStyle(apt),
                                                    opacity: draggingAppointment?.id === apt.id ? 0.4 : 1,
                                                }}
                                                barberColor={getBarberColor(apt.barbeiro_id)}
                                                draggable={true}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                            />
                                        ))}

                                        {/* Drag Preview */}
                                        {draggingAppointment && previewPosition && isSameDay(previewPosition.date, day) && (
                                            <DragPreview
                                                appointment={draggingAppointment}
                                                targetDate={previewPosition.date}
                                                targetHour={previewPosition.hour}
                                                barberColor={getBarberColor(draggingAppointment.barbeiro_id)}
                                                style={getPreviewStyle(day, previewPosition.hour)}
                                            />
                                        )}

                                        {/* Current Time Indicator */}
                                        {isToday(day) && (
                                            <div
                                                className="absolute w-full z-20 pointer-events-none flex items-center"
                                                style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (48 / 60)}px` }}
                                            >
                                                <div className="h-3 w-3 bg-destructive rounded-full -ml-1.5 border-2 border-background" />
                                                <div className="flex-1 border-t-2 border-destructive" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
