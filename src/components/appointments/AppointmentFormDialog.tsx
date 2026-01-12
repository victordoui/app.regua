import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Appointment, AppointmentFormData, Barber, Client, Service, RecurrenceType } from '@/types/appointments';
import { format } from "date-fns";
import { Repeat, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingAppointment: Appointment | null;
  saveAppointment: (formData: AppointmentFormData, id: string | null) => Promise<void>;
  initialDate: Date | undefined;
  initialTime?: string;
  clients: Client[];
  services: Service[];
  barbers: Barber[];
  editMode?: 'single' | 'series';
}

const AppointmentFormDialog: React.FC<AppointmentFormDialogProps> = ({
  isOpen,
  setIsOpen,
  editingAppointment,
  saveAppointment,
  initialDate,
  initialTime,
  clients,
  services,
  barbers,
  editMode = 'single',
}) => {
  const defaultFormData: AppointmentFormData = {
    client_id: "",
    service_id: "",
    service_ids: [],
    barbeiro_id: "",
    appointment_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : "",
    appointment_time: initialTime || "",
    notes: "",
    recurrence_type: null,
    recurrence_end_date: null,
  };

  const [formData, setFormData] = useState<AppointmentFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [useMultiService, setUseMultiService] = useState(false);

  // Calculate totals for multi-service
  const selectedServicesData = useMemo(() => {
    const ids = useMultiService ? (formData.service_ids || []) : (formData.service_id ? [formData.service_id] : []);
    const selected = services.filter(s => ids.includes(s.id));
    return {
      services: selected,
      totalDuration: selected.reduce((sum, s) => sum + s.duration_minutes, 0),
      totalPrice: selected.reduce((sum, s) => sum + s.price, 0)
    };
  }, [formData.service_id, formData.service_ids, services, useMultiService]);

  const toggleService = (serviceId: string) => {
    setFormData(prev => {
      const currentIds = prev.service_ids || [];
      const isSelected = currentIds.includes(serviceId);
      const newIds = isSelected 
        ? currentIds.filter(id => id !== serviceId)
        : [...currentIds, serviceId];
      return { 
        ...prev, 
        service_ids: newIds,
        service_id: newIds[0] || '' // Keep first service as primary for backward compat
      };
    });
  };

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        client_id: editingAppointment.client_id || "",
        service_id: editingAppointment.service_id || "",
        service_ids: editingAppointment.service_id ? [editingAppointment.service_id] : [],
        barbeiro_id: editingAppointment.barbeiro_id || "",
        appointment_date: editingAppointment.appointment_date,
        appointment_time: editingAppointment.appointment_time,
        notes: editingAppointment.notes || "",
        recurrence_type: editingAppointment.recurrence_type || null,
        recurrence_end_date: editingAppointment.recurrence_end_date || null,
      });
      setUseMultiService(false); // TODO: Check if appointment has multiple services
    } else {
      setFormData({
        ...defaultFormData,
        appointment_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : "",
        appointment_time: initialTime || ""
      });
      setUseMultiService(false);
    }
  }, [editingAppointment, initialDate, initialTime, isOpen, clients, services, barbers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveAppointment(formData, editingAppointment?.id || null);
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const recurrenceOptions: { value: RecurrenceType | 'none'; label: string }[] = [
    { value: 'none', label: 'Não repetir' },
    { value: 'weekly', label: 'Toda semana' },
    { value: 'biweekly', label: 'A cada 2 semanas' },
    { value: 'monthly', label: 'Todo mês' },
  ];

  const isSeriesMode = editMode === 'series';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isSeriesMode 
              ? "Editar Série de Agendamentos" 
              : editingAppointment 
                ? "Editar Agendamento" 
                : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
        
        {isSeriesMode && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
            <Repeat className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Alterações serão aplicadas a todos os agendamentos futuros da série</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_id">Cliente</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="service_id">Serviço{useMultiService ? 's' : ''}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUseMultiService(!useMultiService)}
                className="text-xs h-6"
              >
                {useMultiService ? 'Serviço único' : 'Múltiplos serviços'}
              </Button>
            </div>
            
            {!useMultiService ? (
              <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value, service_ids: [value] }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                {/* Selected services chips */}
                {(formData.service_ids || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/50">
                    {(formData.service_ids || []).map(id => {
                      const service = services.find(s => s.id === id);
                      if (!service) return null;
                      return (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {service.name}
                          <button
                            type="button"
                            onClick={() => toggleService(id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                
                {/* Service selection list */}
                <ScrollArea className="h-[150px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {services.map(service => {
                      const isSelected = (formData.service_ids || []).includes(service.id);
                      return (
                        <div
                          key={service.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                            isSelected && "bg-primary/10"
                          )}
                          onClick={() => toggleService(service.id)}
                        >
                          <Checkbox checked={isSelected} />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{service.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {service.duration_minutes}min
                            </span>
                          </div>
                          <span className="text-sm font-medium">R$ {service.price.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                {/* Totals */}
                {selectedServicesData.services.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duração: {selectedServicesData.totalDuration}min</span>
                    </div>
                    <span className="font-semibold">
                      Total: R$ {selectedServicesData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="barbeiro_id">Barbeiro (Opcional)</Label>
            <Select 
              value={formData.barbeiro_id || "unassigned-barber"} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, barbeiro_id: value === "unassigned-barber" ? null : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um barbeiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned-barber">Nenhum (qualquer disponível)</SelectItem>
                {barbers.map(barber => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="appointment_date">Data</Label>
            <Input
              type="date"
              id="appointment_date"
              value={formData.appointment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
              className={cn("w-full p-2 border rounded", isSeriesMode && "opacity-50 cursor-not-allowed")}
              disabled={isSeriesMode}
              required={!isSeriesMode}
            />
            {isSeriesMode && (
              <p className="text-xs text-muted-foreground mt-1">
                Cada agendamento mantém sua data original
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="appointment_time">Hora</Label>
            <Input
              type="time"
              id="appointment_time"
              value={formData.appointment_time}
              onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Recurrence Section */}
          {!editingAppointment && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Repeat className="h-4 w-4" />
                Repetir Agendamento
              </div>
              <div>
                <Select 
                  value={formData.recurrence_type || 'none'} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    recurrence_type: value === 'none' ? null : value as RecurrenceType,
                    recurrence_end_date: value === 'none' ? null : prev.recurrence_end_date
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrenceOptions.map(option => (
                      <SelectItem key={option.value || 'none'} value={option.value || 'none'}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.recurrence_type && (
                <div>
                  <Label htmlFor="recurrence_end_date" className="text-xs text-muted-foreground">
                    Repetir até
                  </Label>
                  <Input
                    type="date"
                    id="recurrence_end_date"
                    value={formData.recurrence_end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_end_date: e.target.value || null }))}
                    min={formData.appointment_date}
                    className="w-full"
                    required
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;
