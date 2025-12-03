import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Barber } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface MonthViewProps {
    appointments: Appointment[];
    selectedDate: Date;
    onDateClick: (date: Date) => void;
    onEventClick: (appointment: Appointment) => void;
    barberColorMap: Map<string, string>;
}

const MonthView: React.FC<MonthViewProps> = ({
    appointments,
    selectedDate,
    onDateClick,
    onEventClick,
    barberColorMap
}) => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter(apt => isSameDay(new Date(apt.appointment_date), day));
    };

    const getBarberColor = (barberId: string | null) => {
        if (!barberId) return 'hsl(var(--primary))';
        return barberColorMap.get(barberId) || 'hsl(var(--primary))';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase border-r last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {days.map((day, idx) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isCurrentMonth = isSameMonth(day, selectedDate);
                    const maxVisible = 3;
                    const hasMore = dayAppointments.length > maxVisible;

                    return (
                        <div
                            key={idx}
                            className={cn(
                                "border-r border-b last:border-r-0 p-1 min-h-[80px] cursor-pointer hover:bg-muted/30 transition-colors",
                                !isCurrentMonth && "bg-muted/20"
                            )}
                            onClick={() => onDateClick(day)}
                        >
                            {/* Day Number */}
                            <div className="flex justify-center mb-1">
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                    isToday(day) && "bg-primary text-primary-foreground",
                                    !isCurrentMonth && "text-muted-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Events */}
                            <div className="space-y-0.5">
                                {dayAppointments.slice(0, maxVisible).map(apt => (
                                    <div
                                        key={apt.id}
                                        className="text-[10px] px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 transition-opacity"
                                        style={{ backgroundColor: getBarberColor(apt.barbeiro_id) }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(apt);
                                        }}
                                    >
                                        {apt.appointment_time.slice(0, 5)} {apt.clients?.name?.split(' ')[0] || 'Cliente'}
                                    </div>
                                ))}
                                {hasMore && (
                                    <div className="text-[10px] text-muted-foreground font-medium px-1.5">
                                        +{dayAppointments.length - maxVisible} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;
