import React, { useState } from 'react';
import { AlertTriangle, DollarSign, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface NoShowFeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (applyFee: boolean, notes?: string) => void;
  clientName: string;
  feeAmount: number;
  feeEnabled: boolean;
}

const NoShowFeeDialog: React.FC<NoShowFeeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  feeAmount,
  feeEnabled
}) => {
  const { toast } = useToast();
  const [applyFee, setApplyFee] = useState(feeEnabled && feeAmount > 0);
  const [waiveFee, setWaiveFee] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const shouldApplyFee = applyFee && !waiveFee && feeEnabled;
      await onConfirm(shouldApplyFee, notes || undefined);
      toast({
        title: 'Falta registrada',
        description: shouldApplyFee 
          ? `Taxa de ${formatCurrency(feeAmount)} será cobrada`
          : 'Cliente marcado como falta sem taxa',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a falta',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setApplyFee(feeEnabled && feeAmount > 0);
    setWaiveFee(false);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Registrar No-Show
          </DialogTitle>
          <DialogDescription>
            O cliente <strong>{clientName}</strong> não compareceu ao agendamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Fee Information */}
          {feeEnabled && feeAmount > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">
                  Taxa de No-Show Configurada
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {formatCurrency(feeAmount)}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-muted bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Taxa de no-show não está habilitada nas configurações
                </span>
              </div>
            </div>
          )}

          {/* Apply/Waive Fee Option */}
          {feeEnabled && feeAmount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="apply-fee" 
                  checked={applyFee && !waiveFee}
                  onCheckedChange={(checked) => {
                    setApplyFee(!!checked);
                    if (checked) setWaiveFee(false);
                  }}
                />
                <Label htmlFor="apply-fee" className="text-sm font-medium">
                  Aplicar taxa de no-show
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="waive-fee" 
                  checked={waiveFee}
                  onCheckedChange={(checked) => {
                    setWaiveFee(!!checked);
                    if (checked) setApplyFee(false);
                  }}
                />
                <Label htmlFor="waive-fee" className="text-sm font-medium">
                  Isentar cliente desta taxa
                </Label>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione uma observação sobre esta falta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar No-Show'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoShowFeeDialog;
