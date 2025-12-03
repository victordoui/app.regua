import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Appointment, AppointmentFormData, Barber, Client, Service, RecurrenceType } from '@/types/appointments';
import { format } from "date-fns";
import { Repeat } from 'lucide-react';

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
}) => {
  const defaultFormData: AppointmentFormData = {
    client_id: "",
    service_id: "",
    barbeiro_id: "",
    appointment_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : "",
    appointment_time: initialTime || "",
    notes: "",
    recurrence_type: null,
    recurrence_end_date: null,
  };

  const [formData, setFormData] = useState<AppointmentFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        client_id: editingAppointment.client_id || "",
        service_id: editingAppointment.service_id || "",
        barbeiro_id: editingAppointment.barbeiro_id || "",
        appointment_date: editingAppointment.appointment_date,
        appointment_time: editingAppointment.appointment_time,
        notes: editingAppointment.notes || "",
        recurrence_type: editingAppointment.recurrence_type || null,
        recurrence_end_date: editingAppointment.recurrence_end_date || null,
      });
    } else {
      setFormData({
        ...defaultFormData,
        appointment_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : "",
        appointment_time: initialTime || ""
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
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
            <Label htmlFor="service_id">Serviço</Label>
            <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))} required>
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
              className="w-full p-2 border rounded"
              required
            />
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
