import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Trash2, X, Palmtree, Stethoscope, User } from 'lucide-react';
import { useBarberAbsences, BarberAbsenceFormData, ABSENCE_TYPES } from '@/hooks/useBarberAbsences';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BarberAbsencesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  barberId: string;
  barberName: string;
}

const BarberAbsencesManager: React.FC<BarberAbsencesManagerProps> = ({
  isOpen,
  onClose,
  barberId,
  barberName
}) => {
  const { absences, addAbsence, deleteAbsence, isAdding, isDeleting, getAbsencesForBarber } = useBarberAbsences();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BarberAbsenceFormData>({
    barber_id: barberId,
    start_date: '',
    end_date: '',
    type: 'vacation',
    notes: ''
  });

  const barberAbsences = getAbsencesForBarber(barberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAbsence({
        ...formData,
        barber_id: barberId
      });
      setShowForm(false);
      setFormData({
        barber_id: barberId,
        start_date: '',
        end_date: '',
        type: 'vacation',
        notes: ''
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (absenceId: string) => {
    try {
      await deleteAbsence(absenceId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getAbsenceIcon = (type: string) => {
    switch (type) {
      case 'vacation':
        return <Palmtree className="h-4 w-4" />;
      case 'sick':
        return <Stethoscope className="h-4 w-4" />;
      case 'personal':
        return <User className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getAbsenceBadgeVariant = (type: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (type) {
      case 'vacation':
        return 'default';
      case 'sick':
        return 'destructive';
      case 'personal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const calculateDays = (start: string, end: string) => {
    try {
      return differenceInDays(parseISO(end), parseISO(start)) + 1;
    } catch {
      return 0;
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Ausências - {barberName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new absence button */}
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Ausência
            </Button>
          )}

          {/* Form for adding new absence */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Nova Ausência</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor="type" className="text-xs">Tipo de Ausência</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'vacation' | 'sick' | 'personal') => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">
                      <span className="flex items-center gap-2">
                        <Palmtree className="h-4 w-4 text-blue-500" />
                        Férias
                      </span>
                    </SelectItem>
                    <SelectItem value="sick">
                      <span className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-red-500" />
                        Atestado Médico
                      </span>
                    </SelectItem>
                    <SelectItem value="personal">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-500" />
                        Pessoal
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start_date" className="text-xs">Data Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-xs">Data Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    min={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-xs">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detalhes adicionais..."
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isAdding} className="flex-1">
                  {isAdding ? "Salvando..." : "Registrar"}
                </Button>
              </div>
            </form>
          )}

          {/* List of absences */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Ausências Registradas ({barberAbsences.length})
              </span>
            </div>

            {barberAbsences.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma ausência registrada</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {barberAbsences.map((absence) => {
                    const isActive = today >= absence.start_date && today <= absence.end_date;
                    const isPast = today > absence.end_date;
                    const days = calculateDays(absence.start_date, absence.end_date);
                    
                    return (
                      <div
                        key={absence.id}
                        className={`flex items-start justify-between p-3 border rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-primary/10 border-primary/30' 
                            : isPast 
                              ? 'bg-muted/30 opacity-60' 
                              : 'bg-background hover:bg-muted/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getAbsenceBadgeVariant(absence.type)} className="text-xs gap-1">
                              {getAbsenceIcon(absence.type)}
                              {ABSENCE_TYPES[absence.type as keyof typeof ABSENCE_TYPES]?.label || absence.type}
                            </Badge>
                            {isActive && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                                Em andamento
                              </Badge>
                            )}
                            {isPast && (
                              <Badge variant="outline" className="text-xs">
                                Concluída
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{formatDate(absence.start_date)}</span>
                            <span className="text-muted-foreground"> até </span>
                            <span className="font-medium">{formatDate(absence.end_date)}</span>
                            <span className="text-muted-foreground"> ({days} {days === 1 ? 'dia' : 'dias'})</span>
                          </div>
                          {absence.notes && (
                            <p className="text-xs text-muted-foreground">{absence.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(absence.id)}
                          disabled={isDeleting}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
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

export default BarberAbsencesManager;
