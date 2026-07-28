import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Tabs } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CalendarDays, Table2, Clock, ListOrdered, SlidersHorizontal, Plus, Users, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';
import WaitlistContent from '@/components/schedule/WaitlistContent';
import ShiftsContent from '@/components/schedule/ShiftsContent';
import { SectionTabsBar } from '@/components/ui/section-tabs';

const scheduleSections = [
  { value: 'agenda', label: 'Agenda', description: 'Calendário de horários', icon: CalendarDays },
  { value: 'espera', label: 'Lista de espera', description: 'Clientes aguardando vaga', icon: ListOrdered },
  { value: 'turnos', label: 'Turnos', description: 'Horários da equipe', icon: Clock },
] as const;

const Appointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const topTab = searchParams.get("tab") || "agenda";
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

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingAppointment(null);
      setSelectedDate(new Date());
      setSelectedTime("");
      setIsDialogOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("new");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { clients, services, barbers, isLoadingClients, isLoadingServices, isLoadingBarbers, fetchAppointments, addAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment, updateAppointmentSeries, appointmentsScopeId } = useAppointments();

  useEffect(() => { if (barbers && barbers.length > 0 && selectedBarbers.length === 0) setSelectedBarbers(barbers.map(b => b.id)); }, [barbers, selectedBarbers.length]);
  const barberColorMap = useMemo(() => { const map = new Map<string, string>(); barbers?.forEach((b, i) => map.set(b.id, BARBER_COLORS[i % BARBER_COLORS.length])); return map; }, [barbers]);
  const { data: appointments = [], isLoading: isLoadingAppointments, error: appointmentsError, refetch: refetchAppointments } = useQuery<Appointment[], Error>({
    queryKey: ["appointments", appointmentsScopeId, "calendar", statusFilter],
    queryFn: () => fetchAppointments(undefined, statusFilter),
    enabled: !!appointmentsScopeId,
  });

  const filteredAppointments = useMemo(() => {
    if (selectedBarbers.length === 0) return [];
    let result = appointments.filter(apt => { if (apt.barbeiro_id && !selectedBarbers.includes(apt.barbeiro_id)) return false; return true; });
    if (createdFilter !== 'all') { result = result.filter(apt => { if (!apt.created_at) return false; const cd = parseISO(apt.created_at); switch (createdFilter) { case 'today': return isToday(cd); case 'week': return isThisWeek(cd, { weekStartsOn: 1 }); case 'month': return cd >= subDays(new Date(), 30); default: return true; } }); }
    return result;
  }, [appointments, selectedBarbers, createdFilter]);

  const newAppointmentsCount = useMemo(() => appointments.filter(apt => apt.created_at && differenceInHours(new Date(), parseISO(apt.created_at)) < 24).length, [appointments]);
  const daysWithAppointments = useMemo(() => { const dates = new Set<string>(); filteredAppointments.forEach(apt => dates.add(apt.appointment_date)); return Array.from(dates); }, [filteredAppointments]);

  const handleManualSchedule = (initialDate?: Date, initialTime?: string) => { setEditingAppointment(null); if (initialDate) setSelectedDate(initialDate); setSelectedTime(initialTime || ''); setIsDialogOpen(true); };
  const handleEdit = (appointment: Appointment) => { if (appointment.recurrence_type || appointment.parent_appointment_id) { setPendingEditAppointment(appointment); setEditSeriesDialogOpen(true); } else { setEditMode('single'); setEditingAppointment(appointment); setIsDialogOpen(true); } };
  const handleEditSingle = () => { setEditMode('single'); setEditingAppointment(pendingEditAppointment); setEditSeriesDialogOpen(false); setIsDialogOpen(true); };
  const handleEditSeries = () => { setEditMode('series'); setEditingAppointment(pendingEditAppointment); setEditSeriesDialogOpen(false); setIsDialogOpen(true); };
  const handleDeleteClick = (appointment: Appointment) => { setDeletingAppointment(appointment); setDeleteDialogOpen(true); };
  const handleDeleteSingle = async (id: string) => { await deleteAppointment(id, false); refetchAppointments(); };
  const handleDeleteSeries = async (id: string) => { await deleteAppointment(id, true); refetchAppointments(); };
  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => { await updateAppointmentStatus({ id, status: newStatus }); refetchAppointments(); };
  const handleSave = async (formData: AppointmentFormData, id: string | null): Promise<void> => { if (id && editMode === 'series') await updateAppointmentSeries({ id, formData, updateFutureOnly: true }); else if (id) await updateAppointment({ id, formData }); else await addAppointment(formData); setEditMode('single'); refetchAppointments(); };
  const handleTimeSlotClick = (date: Date, time: string) => handleManualSchedule(date, time);
  const handleAppointmentMove = async (appointmentId: string, newDate: string, newTime: string) => { const apt = appointments.find(a => a.id === appointmentId); if (!apt || (apt.appointment_date === newDate && apt.appointment_time === newTime)) return; try { await updateAppointment({ id: appointmentId, formData: { client_id: apt.client_id, service_id: apt.service_id, barbeiro_id: apt.barbeiro_id, appointment_date: newDate, appointment_time: newTime, notes: apt.notes || '' } }); toast({ title: "Agendamento movido", description: `Movido para ${format(new Date(newDate), 'dd/MM/yyyy')} às ${newTime}` }); refetchAppointments(); } catch { toast({ title: "Erro ao mover", variant: "destructive" }); } };

  const isLoading = isLoadingClients || isLoadingServices || isLoadingBarbers || isLoadingAppointments;
  const selectedDayCount = filteredAppointments.filter((apt) => apt.appointment_date === format(selectedDate || new Date(), 'yyyy-MM-dd')).length;
  const activeFilterCount = Number(statusFilter !== 'all') + Number(createdFilter !== 'all') + Number(selectedBarbers.length !== (barbers?.length || 0));
  const selectedProfessionalsLabel = selectedBarbers.length === (barbers?.length || 0)
    ? 'Toda a equipe'
    : selectedBarbers.length === 1
      ? '1 profissional'
      : `${selectedBarbers.length} profissionais`;

  const appointmentFilters = (
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
      showPrimaryAction={false}
    />
  );

  return (
    <Layout>
      <div className="flex h-[calc(100dvh-56px)] min-h-0 flex-col bg-muted/30">
        <header className="flex-shrink-0 border-b border-border/80 bg-card px-3 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Operações</p>
                <h1 className="truncate text-xl font-extrabold text-foreground sm:text-2xl">Agenda</h1>
                <p className="hidden text-sm font-medium text-muted-foreground sm:block">Organize horários, equipe e atendimentos do dia.</p>
              </div>
            </div>
            <Button onClick={() => handleManualSchedule(selectedDate)} className="min-h-11 shrink-0 gap-2 rounded-xl px-4 font-bold">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo agendamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>

          <div className="mt-3 flex min-w-0 items-center gap-2 overflow-hidden">
            <Tabs value={topTab} onValueChange={(v) => setSearchParams({ tab: v })} className="min-w-0 flex-1 overflow-x-auto pb-1">
              <SectionTabsBar items={scheduleSections} />
            </Tabs>
          </div>
        </header>

        {topTab === 'agenda' ? (
          <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3">
            <div className="flex flex-shrink-0 items-center justify-between gap-2 rounded-xl border border-border/80 bg-card p-2 shadow-sm sm:px-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant={activeFilterCount > 0 ? 'secondary' : 'outline'} className="min-h-10 gap-2 rounded-lg px-3 font-bold">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                      {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-extrabold text-primary-foreground">{activeFilterCount}</span>}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[min(390px,94vw)] overflow-y-auto p-4 sm:p-5">
                    <SheetHeader className="mb-5 border-b pb-4 text-left">
                      <SheetTitle>Filtros da agenda</SheetTitle>
                      <p className="text-sm text-muted-foreground">Escolha a data, os profissionais e os atendimentos que deseja visualizar.</p>
                    </SheetHeader>
                    {appointmentFilters}
                  </SheetContent>
                </Sheet>

                <div className="hidden h-7 w-px bg-border sm:block" />
                <div className="flex min-w-0 items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-2 text-sm sm:px-3">
                  <Users className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate font-semibold">{selectedProfessionalsLabel}</span>
                </div>
                <span className="hidden rounded-lg bg-primary/10 px-2.5 py-2 text-xs font-bold text-primary sm:inline-flex">{selectedDayCount} {selectedDayCount === 1 ? 'horário no dia' : 'horários no dia'}</span>
                {newAppointmentsCount > 0 && (
                  <button onClick={() => setShowRecentBookings(true)} className="hidden items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-500/25 dark:text-amber-300 sm:flex">
                    {newAppointmentsCount} {newAppointmentsCount === 1 ? 'novo' : 'novos'} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex rounded-lg bg-muted p-1" aria-label="Modo de visualização">
                <Button variant={displayMode === 'calendar' ? 'default' : 'ghost'} size="sm" onClick={() => setDisplayMode('calendar')} className="min-h-9 gap-1.5 rounded-md px-3"><CalendarDays className="h-4 w-4" /><span className="hidden sm:inline">Calendário</span></Button>
                <Button variant={displayMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setDisplayMode('table')} className="min-h-9 gap-1.5 rounded-md px-3"><Table2 className="h-4 w-4" /><span className="hidden sm:inline">Lista</span></Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {appointmentsError ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-destructive/30 bg-card p-6 text-center">
                  <div className="flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"><AlertTriangle className="h-6 w-6" /></div>
                    <div>
                      <h3 className="font-bold text-foreground">Não foi possível carregar a agenda</h3>
                      <p className="mt-1 text-sm text-muted-foreground">A conexão com os agendamentos falhou. Tente novamente para atualizar os horários.</p>
                    </div>
                    <Button variant="outline" onClick={() => refetchAppointments()} className="min-h-10 gap-2 rounded-lg font-bold"><RefreshCw className="h-4 w-4" />Tentar novamente</Button>
                  </div>
                </div>
              ) : isLoading ? <div className="flex h-full items-center justify-center rounded-xl border border-border/60 bg-card"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div><span className="text-sm text-muted-foreground">Carregando agenda...</span></div></div> : displayMode === 'calendar' ? <CalendarView appointments={filteredAppointments} selectedDate={selectedDate || new Date()} onDateChange={setSelectedDate} onTimeSlotClick={handleTimeSlotClick} onEventClick={handleEdit} viewMode={viewMode} onViewModeChange={setViewMode} barberColorMap={barberColorMap} onAppointmentMove={handleAppointmentMove} /> : <AppointmentTableView appointments={filteredAppointments} onEditAppointment={handleEdit} />}
            </div>
          </main>
        ) : topTab === 'espera' ? (
          <div className="flex-1 overflow-y-auto p-6"><WaitlistContent /></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6"><ShiftsContent /></div>
        )}

        {showRecentBookings && <RecentBookingsPanel appointments={appointments} onClose={() => setShowRecentBookings(false)} onSelectAppointment={(apt) => { setShowRecentBookings(false); handleEdit(apt); }} />}
        <AppointmentFormDialog isOpen={isDialogOpen} setIsOpen={(open) => { setIsDialogOpen(open); if (!open) setEditMode('single'); }} editingAppointment={editingAppointment} saveAppointment={handleSave} initialDate={selectedDate} initialTime={selectedTime} clients={clients} services={services} barbers={barbers} editMode={editMode} />
        <EditSeriesDialog isOpen={editSeriesDialogOpen} onClose={() => setEditSeriesDialogOpen(false)} appointment={pendingEditAppointment} onEditSingle={handleEditSingle} onEditSeries={handleEditSeries} />
        <DeleteAppointmentDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} appointment={deletingAppointment} onDeleteSingle={handleDeleteSingle} onDeleteSeries={handleDeleteSeries} />
      </div>
    </Layout>
  );
};

export default Appointments;
