import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentFormDialog from '@/components/appointments/AppointmentFormDialog';
import AppointmentListAndSlots from '@/components/appointments/AppointmentListAndSlots';
import AppointmentSidebar from '@/components/appointments/AppointmentSidebar';
import Layout from '@/components/Layout';
import { Appointment } from '@/types/appointments';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const Appointments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    clients,
    services,
    barbers,
    isLoadingClients,
    isLoadingServices,
    isLoadingBarbers,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  } = useAppointments();

  // Fetch appointments for the selected date and filter
  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery<Appointment[], Error>({
    queryKey: ["appointments", selectedDate, statusFilter],
    queryFn: () => fetchAppointments(selectedDate, statusFilter),
    enabled: !!selectedDate,
  });

  // Fetch all appointments to get days with appointments for the calendar modifier
  const { data: allAppointments = [] } = useQuery<Appointment[], Error>({
    queryKey: ["allAppointments"],
    queryFn: () => fetchAppointments(undefined, 'all'), // Fetch all appointments without date filter
  });

  const daysWithAppointments = useMemo(() => {
    const dates = new Set<string>();
    allAppointments.forEach(apt => dates.add(apt.appointment_date));
    return Array.from(dates);
  }, [allAppointments]);

  const handleManualSchedule = (initialTime?: string) => {
    setEditingAppointment(null);
    setSelectedTime(initialTime || '');
    setIsDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      await deleteAppointment(id);
      refetchAppointments();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    await updateAppointmentStatus({ id, status: newStatus });
    refetchAppointments();
  };

  const handleSave = async (formData: AppointmentFormData, id: string | null): Promise<void> => {
    if (id) {
      await updateAppointment({ id, formData });
    } else {
      await addAppointment(formData);
    }
    refetchAppointments();
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
    handleManualSchedule(time);
  };

  const isLoading = isLoadingClients || isLoadingServices || isLoadingBarbers || isLoadingAppointments;

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
          <Button onClick={() => handleManualSchedule()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AppointmentSidebar
            calendarDate={selectedDate}
            setCalendarDate={setSelectedDate}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            daysWithAppointments={daysWithAppointments}
            onManualSchedule={handleManualSchedule}
          />

          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Carregando agendamentos...</div>
              </div>
            ) : (
              <AppointmentListAndSlots
                appointments={appointments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
                selectedDate={selectedDate}
                onTimeSlotClick={handleTimeSlotClick}
                barbers={barbers}
              />
            )}
          </div>
        </div>

        <AppointmentFormDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingAppointment={editingAppointment}
          saveAppointment={handleSave}
          initialDate={selectedDate}
          initialTime={selectedTime}
          clients={clients}
          services={services}
          barbers={barbers}
        />
      </div>
    </Layout>
  );
};

export default Appointments;