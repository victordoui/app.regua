import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentFormDialog from '@/components/appointments/AppointmentFormDialog';
import AppointmentListAndSlots from '@/components/appointments/AppointmentListAndSlots';
import Layout from '@/components/Layout';
import { Appointment } from '@/types/appointments';

const Appointments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const {
    appointments,
    clients,
    services,
    barbers,
    loading,
    saveAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    fetchData
  } = useAppointments();

  const handleManualSchedule = () => {
    setEditingAppointment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    deleteAppointment(appointment.id);
  };

  const handleUpdateStatus = (appointment: Appointment, newStatus: string) => {
    updateAppointmentStatus(appointment.id, newStatus);
  };

  const handleSave = async (formData: any, id: string | null): Promise<boolean> => {
    const success = await saveAppointment(formData, id);
    if (success) {
      setIsDialogOpen(false);
      setEditingAppointment(null);
      fetchData();
    }
    return success;
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os agendamentos da barbearia
            </p>
          </div>
          <Button onClick={handleManualSchedule}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AppointmentListAndSlots
              appointments={appointments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        </div>

        <AppointmentFormDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingAppointment={editingAppointment}
          saveAppointment={handleSave}
          initialDate={selectedDate}
          initialTime={selectedTime}
        />
      </div>
    </Layout>
  );
};

export default Appointments;