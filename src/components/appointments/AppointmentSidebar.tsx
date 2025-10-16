import React from 'react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Plus } from "lucide-react";

interface AppointmentSidebarProps {
  calendarDate: Date | undefined;
  setCalendarDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  daysWithAppointments: string[];
  onManualSchedule: () => void;
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
    <div className="lg:col-span-1 space-y-4">
      <ModernCard variant="glass">
        <ModernCardHeader>
          <ModernCardTitle>Selecione a Data</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="flex justify-center">
          <ShadcnCalendar
            mode="single"
            selected={calendarDate}
            onSelect={setCalendarDate}
            className="rounded-md border shadow-subtle"
            modifiers={{
              hasAppointments: daysWithAppointments.map(dateStr => new Date(dateStr)),
            }}
            modifiersStyles={{
              hasAppointments: {
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                border: '1px solid hsl(var(--primary) / 0.5)',
              },
            }}
          />
        </ModernCardContent>
      </ModernCard>

      <ModernCard variant="glass">
        <ModernCardHeader>
          <ModernCardTitle>Filtros e Ações</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div>
            <Label>Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent position="popper"> {/* Explicitly setting position to popper */}
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ModernButton 
            variant="gradient" 
            className="w-full"
            onClick={onManualSchedule}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agendar Manualmente
          </ModernButton>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default AppointmentSidebar;