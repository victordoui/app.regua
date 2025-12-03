import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Plus } from "lucide-react";
import { ptBR } from 'date-fns/locale';

interface AppointmentSidebarProps {
  calendarDate: Date | undefined;
  setCalendarDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  daysWithAppointments: string[];
  onManualSchedule: (initialTime?: string) => void;
}

const AppointmentSidebar: React.FC<AppointmentSidebarProps> = ({
  calendarDate,
  setCalendarDate,
  statusFilter,
  setStatusFilter,
  daysWithAppointments,
  onManualSchedule
}) => {
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
          className="w-full"
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
