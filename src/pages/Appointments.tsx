import { useState, useMemo } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentFormDialog from '@/components/appointments/AppointmentFormDialog';
import AppointmentSidebar from '@/components/appointments/AppointmentSidebar';
import CalendarView from '@/components/appointments/CalendarView';
import Layout from '@/components/Layout';
import { Appointment, AppointmentFormData } from '@/types/appointments';
import { useQuery } from '@tanstack/react-query';

const Appointments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

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

  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery<Appointment[], Error>({
    queryKey: ["appointments", "calendar", statusFilter],
    queryFn: () => fetchAppointments(undefined, statusFilter),
  });

  const daysWithAppointments = useMemo(() => {
    const dates = new Set<string>();
    appointments.forEach(apt => dates.add(apt.appointment_date));
    return Array.from(dates);
  }, [appointments]);

  const handleManualSchedule = (initialDate?: Date, initialTime?: string) => {
    setEditingAppointment(null);
    if (initialDate) setSelectedDate(initialDate);
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

  const handleTimeSlotClick = (date: Date, time: string) => {
    handleManualSchedule(date, time);
  };

  const isLoading = isLoadingClients || isLoadingServices || isLoadingBarbers || isLoadingAppointments;

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] flex gap-4">
        {/* Sidebar compacta - Estilo Google */}
        <div className="hidden lg:block w-56 flex-shrink-0 py-4 pl-2">
          <AppointmentSidebar
            calendarDate={selectedDate}
            setCalendarDate={setSelectedDate}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            daysWithAppointments={daysWithAppointments}
            onManualSchedule={() => handleManualSchedule(selectedDate)}
          />
        </div>

        {/* Área principal do calendário */}
        <div className="flex-1 py-4 pr-2 lg:pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-card rounded-lg border">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            </div>
          ) : (
            <CalendarView
              appointments={appointments}
              selectedDate={selectedDate || new Date()}
              onDateChange={setSelectedDate}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleEdit}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}
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
