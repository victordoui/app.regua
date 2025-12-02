import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/appointments';
import CalendarEventCard from './CalendarEventCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarViewProps {
    appointments: Appointment[];
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onTimeSlotClick: (date: Date, time: string) => void;
    onEventClick: (appointment: Appointment) => void;
    viewMode?: 'week' | 'day';
    onViewModeChange?: (mode: 'week' | 'day') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
    appointments,
    selectedDate,
    onDateChange,
    onTimeSlotClick,
    onEventClick,
    viewMode = 'week',
    onViewModeChange
}) => {
    const [currentViewMode, setCurrentViewMode] = useState<'week' | 'day'>(viewMode);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onViewModeChange) {
            setCurrentViewMode(viewMode);
        }
    }, [viewMode, onViewModeChange]);

    // Scroll to 8:00 AM on mount
    useEffect(() => {
        if (scrollRef.current) {
            const hourHeight = 60; // 60px per hour
            const scrollTo = 8 * hourHeight;
            scrollRef.current.scrollTop = scrollTo;
        }
    }, []);

    const handlePrevious = () => {
        if (currentViewMode === 'week') {
            onDateChange(subWeeks(selectedDate, 1));
        } else {
            onDateChange(addDays(selectedDate, -1));
        }
    };

    const handleNext = () => {
        if (currentViewMode === 'week') {
            onDateChange(addWeeks(selectedDate, 1));
        } else {
            onDateChange(addDays(selectedDate, 1));
        }
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday
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
        const duration = appointment.services?.duration_minutes || 30; // Default to 30 min if no duration

        // 1 hour = 60px height
        const top = startMinutes; // 1px per minute
        const height = duration; // 1px per minute

        return {
            top: `${top}px`,
            height: `${height}px`,
            left: '2px',
            right: '2px',
        };
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-background rounded-lg border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleToday}>Hoje</Button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={handlePrevious}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="text-lg font-semibold capitalize">
                        {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                </div>

                <div className="flex bg-muted rounded-lg p-1">
                    <button
                        className={cn(
                            "px-3 py-1 text-sm rounded-md transition-all",
                            currentViewMode === 'day' ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                            setCurrentViewMode('day');
                            onViewModeChange?.('day');
                        }}
                    >
                        Dia
                    </button>
                    <button
                        className={cn(
                            "px-3 py-1 text-sm rounded-md transition-all",
                            currentViewMode === 'week' ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                            setCurrentViewMode('week');
                            onViewModeChange?.('week');
                        }}
                    >
                        Semana
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-hidden">
                {/* Time Labels Column */}
                <div className="w-16 flex-shrink-0 border-r bg-muted/30 overflow-hidden">
                    <div className="h-12 border-b bg-muted/50"></div> {/* Header spacer */}
                    <ScrollArea className="h-full" ref={null}> {/* Sync scroll manually or use same container */}
                        <div className="relative" style={{ height: '1440px' }}> {/* 24h * 60px */}
                            {hours.map(hour => (
                                <div key={hour} className="absolute w-full text-right pr-2 text-xs text-muted-foreground -mt-2" style={{ top: `${hour * 60}px` }}>
                                    {format(new Date().setHours(hour, 0), 'HH:mm')}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Days Columns */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Days Header */}
                    <div className="flex border-b bg-card">
                        {days.map(day => (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "flex-1 h-12 flex flex-col items-center justify-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors",
                                    isToday(day) && "bg-primary/5"
                                )}
                                onClick={() => {
                                    onDateChange(day);
                                    setCurrentViewMode('day');
                                    onViewModeChange?.('day');
                                }}
                            >
                                <span className={cn("text-xs uppercase font-medium", isToday(day) ? "text-primary" : "text-muted-foreground")}>
                                    {format(day, 'EEE', { locale: ptBR })}
                                </span>
                                <div className={cn(
                                    "h-7 w-7 flex items-center justify-center rounded-full text-sm font-bold mt-0.5",
                                    isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Days Grid Scrollable Area */}
                    <ScrollArea className="flex-1" ref={scrollRef}>
                        <div className="flex relative" style={{ height: '1440px' }}>
                            {/* Horizontal Hour Lines (Background) */}
                            <div className="absolute inset-0 w-full pointer-events-none z-0">
                                {hours.map(hour => (
                                    <div key={hour} className="border-b border-border/50 w-full absolute" style={{ top: `${hour * 60}px` }}></div>
                                ))}
                            </div>

                            {days.map(day => (
                                <div key={day.toString()} className="flex-1 border-r last:border-r-0 relative z-10 group">
                                    {/* Clickable Slots */}
                                    {hours.map(hour => (
                                        <div
                                            key={hour}
                                            className="h-[60px] w-full hover:bg-primary/5 transition-colors cursor-pointer border-b border-transparent"
                                            onClick={() => onTimeSlotClick(day, `${hour.toString().padStart(2, '0')}:00`)}
                                        ></div>
                                    ))}

                                    {/* Events */}
                                    {getAppointmentsForDay(day).map(apt => (
                                        <CalendarEventCard
                                            key={apt.id}
                                            appointment={apt}
                                            onClick={onEventClick}
                                            style={getEventStyle(apt)}
                                        />
                                    ))}

                                    {/* Current Time Indicator (if today) */}
                                    {isToday(day) && (
                                        <div
                                            className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                                            style={{ top: `${new Date().getHours() * 60 + new Date().getMinutes()}px` }}
                                        >
                                            <div className="h-2 w-2 bg-red-500 rounded-full -ml-1"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
