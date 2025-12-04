import { useState, useMemo, useEffect } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentFormDialog from '@/components/appointments/AppointmentFormDialog';
import AppointmentSidebar, { BARBER_COLORS } from '@/components/appointments/AppointmentSidebar';
import CalendarView from '@/components/appointments/CalendarView';
import DeleteAppointmentDialog from '@/components/appointments/DeleteAppointmentDialog';
import Layout from '@/components/Layout';
import { Appointment, AppointmentFormData } from '@/types/appointments';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Appointments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);

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

  // Initialize selectedBarbers when barbers load
  useEffect(() => {
    if (barbers && barbers.length > 0 && selectedBarbers.length === 0) {
      setSelectedBarbers(barbers.map(b => b.id));
    }
  }, [barbers]);

  // Create barber color map
  const barberColorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (barbers) {
      barbers.forEach((barber, index) => {
        map.set(barber.id, BARBER_COLORS[index % BARBER_COLORS.length]);
      });
    }
    return map;
  }, [barbers]);

  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery<Appointment[], Error>({
    queryKey: ["appointments", "calendar", statusFilter],
    queryFn: () => fetchAppointments(undefined, statusFilter),
  });

  // Filter appointments by selected barbers
  const filteredAppointments = useMemo(() => {
    if (selectedBarbers.length === 0) return [];
    return appointments.filter(apt => {
      // Show appointments without barber or with selected barbers
      if (!apt.barbeiro_id) return true;
      return selectedBarbers.includes(apt.barbeiro_id);
    });
  }, [appointments, selectedBarbers]);

  const daysWithAppointments = useMemo(() => {
    const dates = new Set<string>();
    filteredAppointments.forEach(apt => dates.add(apt.appointment_date));
    return Array.from(dates);
  }, [filteredAppointments]);

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

  const handleDeleteClick = (appointment: Appointment) => {
    setDeletingAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSingle = async (id: string) => {
    await deleteAppointment(id, false);
    refetchAppointments();
  };

  const handleDeleteSeries = async (id: string) => {
    await deleteAppointment(id, true);
    refetchAppointments();
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

  // Drag and Drop handler
  const handleAppointmentMove = async (appointmentId: string, newDate: string, newTime: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    // Check if date/time actually changed
    if (appointment.appointment_date === newDate && appointment.appointment_time === newTime) {
      return;
    }

    try {
      await updateAppointment({
        id: appointmentId,
        formData: {
          client_id: appointment.client_id,
          service_id: appointment.service_id,
          barbeiro_id: appointment.barbeiro_id,
          appointment_date: newDate,
          appointment_time: newTime,
          notes: appointment.notes || '',
        }
      });
      
      toast({
        title: "Agendamento movido",
        description: `Movido para ${format(new Date(newDate), 'dd/MM/yyyy')} às ${newTime}`,
      });
      
      refetchAppointments();
    } catch (error) {
      toast({
        title: "Erro ao mover",
        description: "Não foi possível mover o agendamento",
        variant: "destructive",
      });
    }
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
            barbers={barbers || []}
            selectedBarbers={selectedBarbers}
            setSelectedBarbers={setSelectedBarbers}
            barberColorMap={barberColorMap}
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
              appointments={filteredAppointments}
              selectedDate={selectedDate || new Date()}
              onDateChange={setSelectedDate}
              onDeleteAppointment={handleDeleteClick}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleEdit}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              barberColorMap={barberColorMap}
              onAppointmentMove={handleAppointmentMove}
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

        <DeleteAppointmentDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          appointment={deletingAppointment}
          onDeleteSingle={handleDeleteSingle}
          onDeleteSeries={handleDeleteSeries}
        />
      </div>
    </Layout>
  );
};

export default Appointments;
