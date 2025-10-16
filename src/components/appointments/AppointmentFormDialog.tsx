import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Appointment, AppointmentFormData, BarberData, Client, Service } from '@/types/appointments';
import { format } from "date-fns";

interface AppointmentFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingAppointment: Appointment | null;
  saveAppointment: (formData: AppointmentFormData, id: string | null) => Promise<boolean>;
  initialDate: Date | undefined;
  initialTime?: string;
}

const AppointmentFormDialog: React.FC<AppointmentFormDialogProps> = ({
  isOpen,
  setIsOpen,
  editingAppointment,
  saveAppointment,
  initialDate,
  initialTime
}) => {
  const defaultFormData: AppointmentFormData = {
    client_id: "",
    service_id: "",
    barbeiro_id: "",
    appointment_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : "",
    appointment_time: initialTime || "",
    notes: "",
  };

  const [formData, setFormData] = useState<AppointmentFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        client_id: editingAppointment.clients?.id || "",
        service_id: editingAppointment.services?.id || "",
        barbeiro_id: editingAppointment.barbeiro_id || "",
        appointment_date: editingAppointment.appointment_date,
        appointment_time: editingAppointment.appointment_time,
        notes: editingAppointment.notes || "",
      });
    } else {
      setFormData({
        ...defaultFormData,
        appointment_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : "",
        appointment_time: initialTime || ""
      });
    }
  }, [editingAppointment, initialDate, initialTime, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await saveAppointment(formData, editingAppointment?.id || null);
    if (success) {
      setIsOpen(false);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_id">Cliente</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Cliente 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="service_id">Serviço</Label>
            <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Corte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="barbeiro_id">Barbeiro</Label>
            <Select value={formData.barbeiro_id} onValueChange={(value) => setFormData(prev => ({ ...prev, barbeiro_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um barbeiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Barbeiro 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="appointment_date">Data</Label>
            <input
              type="date"
              id="appointment_date"
              value={formData.appointment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <Label htmlFor="appointment_time">Hora</Label>
            <input
              type="time"
              id="appointment_time"
              value={formData.appointment_time}
              onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações..."
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;