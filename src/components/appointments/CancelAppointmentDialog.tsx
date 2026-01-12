import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  appointmentDate: string;
  appointmentTime: string;
  canCancel: boolean;
  cancellationError?: string;
}

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentDate,
  appointmentTime,
  canCancel,
  cancellationError,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(reason);
      setReason('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancelar Agendamento
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {canCancel ? (
                <>
                  <p>
                    Tem certeza que deseja cancelar o agendamento de{' '}
                    <strong>{appointmentDate}</strong> às <strong>{appointmentTime}</strong>?
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="cancel-reason">Motivo do cancelamento (opcional)</Label>
                    <Textarea
                      id="cancel-reason"
                      placeholder="Informe o motivo do cancelamento..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-medium">
                    {cancellationError || 'Não é possível cancelar este agendamento.'}
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Voltar</AlertDialogCancel>
          {canCancel && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelAppointmentDialog;
