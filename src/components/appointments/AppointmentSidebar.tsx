import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Plus, CalendarPlus } from "lucide-react";
import { ptBR } from 'date-fns/locale';
import { Barber } from '@/types/appointments';
import { cn } from '@/lib/utils';

export const BARBER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#6366f1', // indigo
];

export type CreatedFilter = 'all' | 'today' | 'week' | 'month';

interface AppointmentSidebarProps {
  calendarDate: Date | undefined;
  setCalendarDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  daysWithAppointments: string[];
  onManualSchedule: (initialTime?: string) => void;
  barbers: Barber[];
  selectedBarbers: string[];
  setSelectedBarbers: (barbers: string[]) => void;
  barberColorMap: Map<string, string>;
  createdFilter?: CreatedFilter;
  setCreatedFilter?: (filter: CreatedFilter) => void;
  newAppointmentsCount?: number;
  onShowRecentBookings?: () => void;
}

const AppointmentSidebar: React.FC<AppointmentSidebarProps> = ({
  calendarDate,
  setCalendarDate,
  statusFilter,
  setStatusFilter,
  daysWithAppointments,
  onManualSchedule,
  barbers,
  selectedBarbers,
  setSelectedBarbers,
  barberColorMap,
  createdFilter = 'all',
  setCreatedFilter,
  newAppointmentsCount = 0,
  onShowRecentBookings
}) => {
  const toggleBarber = (barberId: string) => {
    if (selectedBarbers.includes(barberId)) {
      setSelectedBarbers(selectedBarbers.filter(id => id !== barberId));
    } else {
      setSelectedBarbers([...selectedBarbers, barberId]);
    }
  };

  const toggleAllBarbers = () => {
    if (selectedBarbers.length === barbers.length) {
      setSelectedBarbers([]);
    } else {
      setSelectedBarbers(barbers.map(b => b.id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Botão Criar - Estilo Google */}
      <Button
        onClick={() => onManualSchedule()}
        className="w-full h-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        <Plus className="h-5 w-5 mr-2" />
        Criar
      </Button>

      {/* Mini Calendário */}
      <div className="bg-card rounded-lg border p-2">
        <ShadcnCalendar
          mode="single"
          selected={calendarDate}
          onSelect={setCalendarDate}
          className="w-full pointer-events-auto"
          classNames={{
            months: "w-full",
            month: "w-full space-y-2",
            caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem] flex-1 text-center",
            row: "flex w-full mt-1",
            cell: "text-center text-xs p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full mx-auto flex items-center justify-center text-xs",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground font-semibold",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          modifiers={{
            hasAppointments: daysWithAppointments.map(dateStr => new Date(dateStr)),
          }}
          modifiersStyles={{
            hasAppointments: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              textDecorationColor: 'hsl(var(--primary))',
            },
          }}
          locale={ptBR}
        />
      </div>

      {/* Filtro por Barbeiro */}
      {barbers.length > 0 && (
        <div className="bg-card rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Minhas Agendas
            </Label>
            <button
              onClick={toggleAllBarbers}
              className="text-[10px] text-primary hover:underline"
            >
              {selectedBarbers.length === barbers.length ? 'Desmarcar' : 'Marcar'} todos
            </button>
          </div>
          <div className="space-y-1.5">
            {barbers.map((barber) => {
              const color = barberColorMap.get(barber.id) || BARBER_COLORS[0];
              const isSelected = selectedBarbers.includes(barber.id);
              
              return (
                <label
                  key={barber.id}
                  className="flex items-center gap-2 cursor-pointer group py-1 px-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBarber(barber.id)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                        isSelected ? "border-transparent" : "border-muted-foreground/40"
                      )}
                      style={{ backgroundColor: isSelected ? color : 'transparent' }}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm truncate flex-1",
                    !isSelected && "text-muted-foreground"
                  )}>
                    {barber.full_name}
                  </span>
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Button for Recent Bookings */}
      {onShowRecentBookings && (
        <Button
          variant="outline"
          onClick={onShowRecentBookings}
          className="w-full justify-start gap-2 relative"
        >
          <CalendarPlus className="h-4 w-4" />
          <span>Novos Agendamentos</span>
          {newAppointmentsCount > 0 && (
            <span className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-amber-950 animate-pulse">
              {newAppointmentsCount > 9 ? '9+' : newAppointmentsCount}
            </span>
          )}
        </Button>
      )}

      {/* Filtro por Data de Criação */}
      {setCreatedFilter && (
        <div className="bg-card rounded-lg border p-3 space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Criados em
          </Label>
          <Select value={createdFilter} onValueChange={(v) => setCreatedFilter(v as CreatedFilter)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="today">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Criados Hoje
                </span>
              </SelectItem>
              <SelectItem value="week">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Esta Semana
                </span>
              </SelectItem>
              <SelectItem value="month">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Último Mês
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filtro de Status */}
      <div className="bg-card rounded-lg border p-3 space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Filtrar por Status
        </Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Pendente
              </span>
            </SelectItem>
            <SelectItem value="confirmed">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Confirmado
              </span>
            </SelectItem>
            <SelectItem value="completed">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Concluído
              </span>
            </SelectItem>
            <SelectItem value="cancelled">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Cancelado
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AppointmentSidebar;
