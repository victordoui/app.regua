import React from 'react';
import { Edit, Trash2, Check, X, Phone, User, Clock, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Appointment } from '@/types/appointments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onDelete, onUpdateStatus }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{appointment.clients?.name || 'Cliente Desconhecido'}</h3>
          <p className="text-sm text-muted-foreground">{appointment.services?.name || 'Serviço Desconhecido'}</p>
          <Badge variant={getStatusBadgeVariant(appointment.status)} className="mt-1">
            {getStatusText(appointment.status)}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(appointment)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => onUpdateStatus(appointment.id, 'completed')}>
                <Check className="mr-2 h-4 w-4" /> Marcar como Concluído
              </DropdownMenuItem>
            )}
            {appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => onUpdateStatus(appointment.id, 'cancelled')}>
                <X className="mr-2 h-4 w-4" /> Cancelar Agendamento
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(appointment.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{appointment.appointment_time}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{appointment.barbers?.full_name || 'Barbeiro Não Atribuído'}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>{formatCurrency(appointment.total_price)}</span>
        </div>
      </div>

      {appointment.notes && (
        <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
          **Observações:** {appointment.notes}
        </p>
      )}
    </div>
  );
};

export default AppointmentCard;