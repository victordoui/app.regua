import React, { useState } from 'react';
import { Edit, Trash2, Check, X, User, Clock, Calendar as CalendarIcon, DollarSign, CalendarPlus, Sparkles } from 'lucide-react';
import { Appointment } from '@/types/appointments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, parseISO, formatDistanceToNow, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAppointmentAttendeeName, parseGroupBookingNotes } from '@/lib/groupBooking';
import { formatDateOnlyBR } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseTipAmount } from '@/lib/tipAmount';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled', tipAmount?: number) => void | Promise<void>;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onDelete, onUpdateStatus }) => {
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [tipInput, setTipInput] = useState('');
  const [tipError, setTipError] = useState('');
  const [savingCompletion, setSavingCompletion] = useState(false);
  const attendeeName = getAppointmentAttendeeName(appointment);
  const groupMetadata = parseGroupBookingNotes(appointment.notes);
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

  // Check if appointment was created within last 24 hours
  const isNew = appointment.created_at 
    ? differenceInHours(new Date(), parseISO(appointment.created_at)) < 24 
    : false;

  const getRelativeCreatedTime = () => {
    if (!appointment.created_at) return null;
    return formatDistanceToNow(parseISO(appointment.created_at), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  const getFormattedCreatedAt = () => {
    if (!appointment.created_at) return null;
    return format(parseISO(appointment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const openTipDialog = (editExisting = false) => {
    setTipError('');
    setTipInput(editExisting && appointment.tip_amount ? String(appointment.tip_amount).replace('.', ',') : '');
    setTipDialogOpen(true);
  };

  const completeAppointment = async () => {
    const tipAmount = parseTipAmount(tipInput);
    if (tipAmount === null) {
      setTipError('Informe um valor válido, com até duas casas decimais.');
      return;
    }

    setSavingCompletion(true);
    setTipError('');
    try {
      await onUpdateStatus(appointment.id, 'completed', tipAmount);
      setTipDialogOpen(false);
      setTipInput('');
    } catch {
      setTipError('Não foi possível concluir o atendimento. Tente novamente.');
    } finally {
      setSavingCompletion(false);
    }
  };

  return (
    <>
    <div className="border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow relative">
      {/* New Badge */}
      {isNew && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-amber-500 text-amber-950 animate-pulse flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Novo
          </Badge>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{attendeeName}</h3>
          {groupMetadata.groupId && (
            <p className="text-xs text-muted-foreground">Responsável: {groupMetadata.responsibleName}</p>
          )}
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
              <DropdownMenuItem onClick={() => openTipDialog()}>
                <Check className="mr-2 h-4 w-4" /> Marcar como Concluído
              </DropdownMenuItem>
            )}
            {appointment.status === 'completed' && (
              <DropdownMenuItem onClick={() => openTipDialog(true)}>
                <DollarSign className="mr-2 h-4 w-4" /> {Number(appointment.tip_amount || 0) > 0 ? 'Editar gorjeta' : 'Registrar gorjeta'}
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
          <span>{formatDateOnlyBR(appointment.appointment_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{appointment.appointment_time}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{appointment.barbers?.full_name || 'Profissional Não Atribuído'}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>{formatCurrency(appointment.total_price)}{appointment.status === 'completed' && Number(appointment.tip_amount || 0) > 0 && <span className="ml-2 text-xs text-muted-foreground">+ {formatCurrency(appointment.tip_amount)} gorjeta</span>}</span>
        </div>
      </div>

      {/* Created at info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2 mt-2">
        <CalendarPlus className="h-3 w-3" />
        <span>
          Agendado {getRelativeCreatedTime() || 'N/A'}
          {getFormattedCreatedAt() && (
            <span className="text-muted-foreground/70"> • {getFormattedCreatedAt()}</span>
          )}
        </span>
      </div>

      {appointment.notes && (
        <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
          **Observações:** {appointment.notes}
        </p>
      )}
    </div>
    <Dialog open={tipDialogOpen} onOpenChange={(open) => { if (!savingCompletion) setTipDialogOpen(open); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointment.status === 'completed' ? 'Registrar gorjeta' : 'Concluir atendimento'}</DialogTitle>
          <DialogDescription>Informe a gorjeta, se o cliente deixou alguma. Esse valor fica separado do preço do serviço e da comissão.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`appointment-tip-${appointment.id}`}>Gorjeta (opcional)</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
            <Input id={`appointment-tip-${appointment.id}`} inputMode="decimal" autoComplete="off" className="pl-10" value={tipInput} onChange={(event) => { setTipInput(event.target.value); setTipError(''); }} placeholder="0,00" aria-invalid={Boolean(tipError)} aria-describedby={tipError ? `appointment-tip-error-${appointment.id}` : undefined} />
          </div>
          {tipError && <p id={`appointment-tip-error-${appointment.id}`} className="text-sm text-destructive" role="alert">{tipError}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setTipDialogOpen(false)} disabled={savingCompletion}>Voltar</Button>
          <Button type="button" onClick={() => void completeAppointment()} disabled={savingCompletion}>
            <Check className="mr-2 h-4 w-4" />{savingCompletion ? 'Salvando…' : appointment.status === 'completed' ? 'Salvar gorjeta' : 'Concluir atendimento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AppointmentCard;
