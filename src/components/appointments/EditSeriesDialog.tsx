import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Appointment } from '@/types/appointments';
import { Repeat, Calendar } from 'lucide-react';

interface EditSeriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEditSingle: () => void;
  onEditSeries: () => void;
}

const EditSeriesDialog: React.FC<EditSeriesDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  onEditSingle,
  onEditSeries,
}) => {
  if (!appointment) return null;

  const getRecurrenceLabel = (type: string | null | undefined) => {
    switch (type) {
      case 'weekly': return 'semanal';
      case 'biweekly': return 'quinzenal';
      case 'monthly': return 'mensal';
      default: return 'recorrente';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Editar agendamento recorrente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Este agendamento faz parte de uma série {getRecurrenceLabel(appointment.recurrence_type)}.
            Como deseja editar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <button
            onClick={onEditSingle}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
          >
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Apenas este agendamento</div>
              <div className="text-sm text-muted-foreground">
                Editar somente o agendamento de {appointment.appointment_date}
              </div>
            </div>
          </button>
          <button
            onClick={onEditSeries}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
          >
            <Repeat className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Toda a série</div>
              <div className="text-sm text-muted-foreground">
                Aplicar alterações a todos os agendamentos futuros da série
              </div>
            </div>
          </button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditSeriesDialog;
