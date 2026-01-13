import React, { useState } from 'react';
import { Appointment } from '@/types/appointments';
import { format, parseISO, formatDistanceToNow, isToday, isThisWeek, subDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarPlus, Clock, User, Scissors, X, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface RecentBookingsPanelProps {
  appointments: Appointment[];
  onClose: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month';

const RecentBookingsPanel: React.FC<RecentBookingsPanelProps> = ({
  appointments,
  onClose,
  onSelectAppointment,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');

  // Sort by created_at descending (most recent first)
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Filter by period
  const filteredAppointments = sortedAppointments.filter(apt => {
    if (!apt.created_at) return false;
    const createdDate = parseISO(apt.created_at);
    
    switch (filterPeriod) {
      case 'today':
        return isToday(createdDate);
      case 'week':
        return isThisWeek(createdDate, { weekStartsOn: 1 });
      case 'month':
        return createdDate >= subDays(new Date(), 30);
      default:
        return true;
    }
  }).slice(0, 20); // Limit to 20 most recent

  const isNew = (apt: Appointment) => {
    if (!apt.created_at) return false;
    return differenceInHours(new Date(), parseISO(apt.created_at)) < 24;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-orange-500';
      default: return 'bg-amber-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'Não compareceu';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Agendamentos Recentes</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Criados Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="ml-auto">
            {filteredAppointments.length} agendamentos
          </Badge>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento encontrado para este período</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => onSelectAppointment(apt)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                  isNew(apt) && "ring-2 ring-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isNew(apt) && (
                      <Badge className="bg-amber-500 text-amber-950 text-[10px] py-0 animate-pulse">
                        <Sparkles className="w-2 h-2 mr-0.5" />
                        NOVO
                      </Badge>
                    )}
                    <span className="font-medium">{apt.clients?.name || 'Cliente'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(apt.status))} />
                    <span className="text-xs text-muted-foreground">{getStatusText(apt.status)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Scissors className="h-3 w-3" />
                    <span className="truncate">{apt.services?.name || 'Serviço'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    <span className="truncate">{apt.barbers?.full_name || 'Sem barbeiro'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(parseISO(apt.appointment_date), 'dd/MM', { locale: ptBR })} às {apt.appointment_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <CalendarPlus className="h-3 w-3" />
                    <span>
                      {apt.created_at 
                        ? formatDistanceToNow(parseISO(apt.created_at), { addSuffix: true, locale: ptBR })
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentBookingsPanel;
