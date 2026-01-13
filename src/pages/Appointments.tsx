import { useState, useMemo, useEffect } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentFormDialog from '@/components/appointments/AppointmentFormDialog';
import AppointmentSidebar, { BARBER_COLORS, CreatedFilter } from '@/components/appointments/AppointmentSidebar';
import CalendarView from '@/components/appointments/CalendarView';
import DeleteAppointmentDialog from '@/components/appointments/DeleteAppointmentDialog';
import EditSeriesDialog from '@/components/appointments/EditSeriesDialog';
import RecentBookingsPanel from '@/components/appointments/RecentBookingsPanel';
import AppointmentTableView from '@/components/appointments/AppointmentTableView';
import Layout from '@/components/Layout';
import { Appointment, AppointmentFormData } from '@/types/appointments';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, isToday, isThisWeek, subDays, differenceInHours } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Table2, Radio } from 'lucide-react';

const Appointments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [displayMode, setDisplayMode] = useState<'calendar' | 'table'>('calendar');
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [editSeriesDialogOpen, setEditSeriesDialogOpen] = useState(false);
  const [pendingEditAppointment, setPendingEditAppointment] = useState<Appointment | null>(null);
  const [editMode, setEditMode] = useState<'single' | 'series'>('single');
  const [createdFilter, setCreatedFilter] = useState<CreatedFilter>('all');
  const [showRecentBookings, setShowRecentBookings] = useState(false);

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
    updateAppointmentSeries,
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

  // Filter appointments by selected barbers and created date
  const filteredAppointments = useMemo(() => {
    if (selectedBarbers.length === 0) return [];
    
    let result = appointments.filter(apt => {
      // Filter by barber
      if (apt.barbeiro_id && !selectedBarbers.includes(apt.barbeiro_id)) {
        return false;
      }
      return true;
    });

    // Filter by created date
    if (createdFilter !== 'all') {
      result = result.filter(apt => {
        if (!apt.created_at) return false;
        const createdDate = parseISO(apt.created_at);
        
        switch (createdFilter) {
          case 'today':
            return isToday(createdDate);
          case 'week':
            return isThisWeek(createdDate, { weekStartsOn: 1 });
          case 'month':
            return createdDate >= subDays(new Date(), 30);
          default:
            return true;
        }
      });
    }

    return result;
  }, [appointments, selectedBarbers, createdFilter]);

  // Count new appointments (created in last 24h)
  const newAppointmentsCount = useMemo(() => {
    return appointments.filter(apt => {
      if (!apt.created_at) return false;
      return differenceInHours(new Date(), parseISO(apt.created_at)) < 24;
    }).length;
  }, [appointments]);

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
    const isRecurring = appointment.recurrence_type || appointment.parent_appointment_id;
    
    if (isRecurring) {
      setPendingEditAppointment(appointment);
      setEditSeriesDialogOpen(true);
    } else {
      setEditMode('single');
      setEditingAppointment(appointment);
      setIsDialogOpen(true);
    }
  };

  const handleEditSingle = () => {
    setEditMode('single');
    setEditingAppointment(pendingEditAppointment);
    setEditSeriesDialogOpen(false);
    setIsDialogOpen(true);
  };

  const handleEditSeries = () => {
    setEditMode('series');
    setEditingAppointment(pendingEditAppointment);
    setEditSeriesDialogOpen(false);
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
    if (id && editMode === 'series') {
      await updateAppointmentSeries({ id, formData, updateFutureOnly: true });
    } else if (id) {
      await updateAppointment({ id, formData });
    } else {
      await addAppointment(formData);
    }
    setEditMode('single');
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
      <div className="h-[calc(100vh-56px)] flex flex-col">
        {/* Header personalizado */}
        <div className="px-4 py-3 border-b bg-card/50 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              Agenda - <span className="text-primary">Marshals Barber</span>
            </h1>
            <Badge variant="outline" className="gap-1.5 animate-pulse">
              <Radio className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              Ao Vivo
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Calendar/Table View */}
            <div className="bg-muted rounded-lg p-1 flex gap-1">
              <Button
                variant={displayMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('calendar')}
                className="gap-1.5"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendário</span>
              </Button>
              <Button
                variant={displayMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('table')}
                className="gap-1.5"
              >
                <Table2 className="h-4 w-4" />
                <span className="hidden sm:inline">Tabela</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Sidebar compacta - Estilo Google */}
          <div className="hidden lg:block w-56 flex-shrink-0 py-4 pl-2 overflow-y-auto">
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
              createdFilter={createdFilter}
              setCreatedFilter={setCreatedFilter}
              newAppointmentsCount={newAppointmentsCount}
              onShowRecentBookings={() => setShowRecentBookings(true)}
            />
          </div>

          {/* Área principal */}
          <div className="flex-1 py-4 pr-2 lg:pr-4 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-card rounded-lg border">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              </div>
            ) : displayMode === 'calendar' ? (
              <CalendarView
                appointments={filteredAppointments}
                selectedDate={selectedDate || new Date()}
                onDateChange={setSelectedDate}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleEdit}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                barberColorMap={barberColorMap}
                onAppointmentMove={handleAppointmentMove}
              />
            ) : (
              <AppointmentTableView
                appointments={filteredAppointments}
                onEditAppointment={handleEdit}
              />
            )}
          </div>
        </div>

        {/* Recent Bookings Panel */}
        {showRecentBookings && (
          <RecentBookingsPanel
            appointments={appointments}
            onClose={() => setShowRecentBookings(false)}
            onSelectAppointment={(apt) => {
              setShowRecentBookings(false);
              handleEdit(apt);
            }}
          />
        )}

        <AppointmentFormDialog
          isOpen={isDialogOpen}
          setIsOpen={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditMode('single');
          }}
          editingAppointment={editingAppointment}
          saveAppointment={handleSave}
          initialDate={selectedDate}
          initialTime={selectedTime}
          clients={clients}
          services={services}
          barbers={barbers}
          editMode={editMode}
        />

        <EditSeriesDialog
          isOpen={editSeriesDialogOpen}
          onClose={() => setEditSeriesDialogOpen(false)}
          appointment={pendingEditAppointment}
          onEditSingle={handleEditSingle}
          onEditSeries={handleEditSeries}
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
