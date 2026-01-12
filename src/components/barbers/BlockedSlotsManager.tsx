import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Plus, Trash2, X } from 'lucide-react';
import { useBlockedSlots, BlockedSlot, BlockedSlotFormData } from '@/hooks/useBlockedSlots';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlockedSlotsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  barberId: string;
  barberName: string;
}

const BlockedSlotsManager: React.FC<BlockedSlotsManagerProps> = ({
  isOpen,
  onClose,
  barberId,
  barberName
}) => {
  const { blockedSlots, addBlockedSlot, deleteBlockedSlot, isAdding, isDeleting, getBlockedSlotsForBarber } = useBlockedSlots();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BlockedSlotFormData>({
    barber_id: barberId,
    start_datetime: '',
    end_datetime: '',
    reason: ''
  });

  const barberSlots = getBlockedSlotsForBarber(barberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBlockedSlot({
        ...formData,
        barber_id: barberId
      });
      setShowForm(false);
      setFormData({
        barber_id: barberId,
        start_datetime: '',
        end_datetime: '',
        reason: ''
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (slotId: string) => {
    try {
      await deleteBlockedSlot(slotId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = parseISO(dateTimeStr);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Horários Bloqueados - {barberName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new block button */}
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Bloquear Novo Horário
            </Button>
          )}

          {/* Form for adding new blocked slot */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Novo Bloqueio</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start_datetime" className="text-xs">Início</Label>
                  <Input
                    id="start_datetime"
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="end_datetime" className="text-xs">Fim</Label>
                  <Input
                    id="end_datetime"
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason" className="text-xs">Motivo (opcional)</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ex: Almoço, Reunião, Compromisso pessoal..."
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isAdding} className="flex-1">
                  {isAdding ? "Salvando..." : "Bloquear"}
                </Button>
              </div>
            </form>
          )}

          {/* List of blocked slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Bloqueios Ativos ({barberSlots.length})
              </span>
            </div>

            {barberSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum horário bloqueado</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {barberSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-start justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatDateTime(slot.start_datetime)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">até</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatDateTime(slot.end_datetime)}
                          </Badge>
                        </div>
                        {slot.reason && (
                          <p className="text-xs text-muted-foreground">{slot.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockedSlotsManager;
