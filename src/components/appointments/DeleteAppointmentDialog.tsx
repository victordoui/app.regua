import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointments";
import { Trash2, Calendar, CalendarX } from "lucide-react";

interface DeleteAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onDeleteSingle: (id: string) => Promise<void>;
  onDeleteSeries: (id: string) => Promise<void>;
}

export default function DeleteAppointmentDialog({
  isOpen,
  onClose,
  appointment,
  onDeleteSingle,
  onDeleteSeries,
}: DeleteAppointmentDialogProps) {
  if (!appointment) return null;

  const isRecurring = !!(appointment.recurrence_type || appointment.parent_appointment_id);

  const handleDeleteSingle = async () => {
    await onDeleteSingle(appointment.id);
    onClose();
  };

  const handleDeleteSeries = async () => {
    await onDeleteSeries(appointment.id);
    onClose();
  };

  if (!isRecurring) {
    // Simple confirmation for non-recurring appointments
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Excluir Agendamento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Recurring appointment - show options
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Excluir Agendamento Recorrente
          </AlertDialogTitle>
          <AlertDialogDescription>
            Este é um agendamento recorrente. Como você deseja proceder?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4"
            onClick={handleDeleteSingle}
          >
            <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium">Excluir apenas este</div>
              <div className="text-sm text-muted-foreground">
                Remove somente este agendamento da série
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4 border-destructive/50 hover:bg-destructive/10"
            onClick={handleDeleteSeries}
          >
            <CalendarX className="h-5 w-5 mr-3 text-destructive" />
            <div className="text-left">
              <div className="font-medium text-destructive">Excluir toda a série</div>
              <div className="text-sm text-muted-foreground">
                Remove este e todos os agendamentos relacionados
              </div>
            </div>
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
