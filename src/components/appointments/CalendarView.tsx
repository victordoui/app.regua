import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/appointments';
import CalendarEventCard from './CalendarEventCard';
import MonthView from './MonthView';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onViewModeChange) {
            setCurrentViewMode(viewMode);
        }
    }, [viewMode, onViewModeChange]);

    useEffect(() => {
        if (scrollRef.current && currentViewMode !== 'month') {
            const hourHeight = 48;
            const scrollTo = 8 * hourHeight;
            scrollRef.current.scrollTop = scrollTo;
        }
    }, [currentViewMode]);

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
        return appointments.filter(apt => isSameDay(new Date(apt.appointment_date), day));
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
    };

    const handleDragOver = (e: React.DragEvent, slotKey: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverSlot(slotKey);
    };

    const handleDragLeave = () => {
        setDragOverSlot(null);
    };

    const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
        e.preventDefault();
        setDragOverSlot(null);
        
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

    return (
        <div className="flex flex-col h-full bg-card rounded-lg border overflow-hidden">
            {/* Header - Estilo Google Calendar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleToday}
                        className="h-8 px-4 text-sm font-medium"
                    >
                        Hoje
                    </Button>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="text-lg font-medium capitalize ml-2">
                        {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                </div>

                <div className="flex bg-muted rounded-lg p-0.5">
                    <button
                        className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-all font-medium",
                            currentViewMode === 'day' 
                                ? "bg-background shadow-sm text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleViewModeChange('day')}
                    >
                        Dia
                    </button>
                    <button
                        className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-all font-medium",
                            currentViewMode === 'week' 
                                ? "bg-background shadow-sm text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleViewModeChange('week')}
                    >
                        Semana
                    </button>
                    <button
                        className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-all font-medium",
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
                <div className="flex flex-1 overflow-hidden">
                    {/* Time Labels Column */}
                    <div className="w-14 flex-shrink-0 border-r">
                        <div className="h-10 border-b"></div>
                        <div className="overflow-hidden" style={{ height: 'calc(100% - 40px)' }}>
                            <div className="relative" style={{ height: '1152px' }}>
                                {hours.map(hour => (
                                    <div 
                                        key={hour} 
                                        className="absolute w-full text-right pr-2 text-[10px] text-muted-foreground -translate-y-1/2" 
                                        style={{ top: `${hour * 48}px` }}
                                    >
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Days Columns */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Days Header */}
                        <div className="flex border-b h-10">
                            {days.map(day => (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "flex-1 flex flex-col items-center justify-center border-r last:border-r-0 cursor-pointer hover:bg-muted/30 transition-colors"
                                    )}
                                    onClick={() => {
                                        onDateChange(day);
                                        handleViewModeChange('day');
                                    }}
                                >
                                    <span className={cn(
                                        "text-[10px] uppercase font-medium",
                                        isToday(day) ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {format(day, 'EEE', { locale: ptBR })}
                                    </span>
                                    <span className={cn(
                                        "text-lg font-medium leading-none",
                                        isToday(day) 
                                            ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center" 
                                            : "text-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Days Grid Scrollable Area */}
                        <div className="flex-1 overflow-auto" ref={scrollRef}>
                            <div className="flex relative" style={{ height: '1152px' }}>
                                {/* Hour Lines */}
                                <div className="absolute inset-0 w-full pointer-events-none">
                                    {hours.map(hour => (
                                        <div 
                                            key={hour} 
                                            className="border-b border-border/40 w-full absolute" 
                                            style={{ top: `${hour * 48}px`, height: '48px' }}
                                        />
                                    ))}
                                </div>

                                {days.map(day => (
                                    <div key={day.toString()} className="flex-1 border-r last:border-r-0 relative">
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
                                                    onDragOver={(e) => handleDragOver(e, slotKey)}
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
                                                style={getEventStyle(apt)}
                                                barberColor={getBarberColor(apt.barbeiro_id)}
                                                draggable={true}
                                                onDragStart={handleDragStart}
                                            />
                                        ))}

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
            )}
        </div>
    );
};

export default CalendarView;
