import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

  // Fetch appointments for the selected date range
  // For week view, we need to fetch the whole week. For simplicity, we'll fetch the whole month or a larger range in a real app.
  // Here, we'll stick to the existing hook but maybe we need to adjust it to fetch by range instead of single date.
  // Assuming fetchAppointments can handle a date range or we fetch for the current view.
  // For now, let's assume fetchAppointments(undefined, 'all') fetches everything or we rely on the date filter.
  // Ideally, we should refactor fetchAppointments to accept start/end dates.
  // Given the current implementation of fetchAppointments (based on previous context), it might filter by exact date if provided.
  // Let's fetch ALL appointments for now to populate the calendar, as filtering by single date won't work for week view.
  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery<Appointment[], Error>({
    queryKey: ["appointments", "calendar", statusFilter], // Changed key to avoid conflict
    queryFn: () => fetchAppointments(undefined, statusFilter), // Fetch all to populate calendar
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
      <div className="flex-1 space-y-6 p-6 h-[calc(100vh-64px)] flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie sua agenda de forma visual
            </p>
          </div>
          <Button onClick={() => handleManualSchedule(new Date())} className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          {/* Sidebar - Hidden on mobile, visible on lg screens */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-6 overflow-y-auto pr-2">
            <AppointmentSidebar
              calendarDate={selectedDate}
              setCalendarDate={setSelectedDate}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              daysWithAppointments={daysWithAppointments}
              onManualSchedule={() => handleManualSchedule(selectedDate)}
            />
          </div>

          {/* Main Calendar Area */}
          <div className="col-span-1 lg:col-span-9 xl:col-span-10 h-full flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-card rounded-lg border">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <div className="text-muted-foreground">Carregando agenda...</div>
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