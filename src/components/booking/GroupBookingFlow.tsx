import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Scissors,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildGroupBookingNotes } from '@/lib/groupBooking';
import { appointmentsConflict, blockedPeriodConflict } from '@/lib/bookingAvailability';
import { translateBookingError } from '@/lib/bookingErrors';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface GroupBookingFlowProps {
  userId: string;
}

interface BookingService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url?: string;
}

interface BookingProfessional {
  id: string;
  name: string;
  avatar?: string;
}

interface BookingParticipant {
  id: string;
  name: string;
  relationship: string;
  serviceIds: string[];
  professionalId: string;
  date?: Date;
  time: string;
}

interface AvailableSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface BusinessHour {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean | null;
}

const STEPS = [
  { id: 1, label: 'Pessoas', description: 'Serviços por pessoa' },
  { id: 2, label: 'Horários', description: 'Vagas individuais' },
  { id: 3, label: 'Revisão', description: 'Valores separados' },
];

const RELATIONSHIPS = ['Eu', 'Filho(a)', 'Esposa(o)', 'Sobrinho(a)', 'Amigo(a)', 'Outra pessoa'];

const createParticipant = (relationship = 'Outra pessoa'): BookingParticipant => ({
  id: crypto.randomUUID(),
  name: relationship === 'Eu' ? 'Você' : '',
  relationship,
  serviceIds: [],
  professionalId: '',
  date: undefined,
  time: '',
});

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const minutesFromTime = (time: string) => {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
};

const existingAppointmentDuration = (appointment: unknown) => {
  const slot = appointment as {
    duration_minutes?: number;
    services?: { duration_minutes?: number } | null;
    appointment_services?: Array<{ services?: { duration_minutes?: number } | null }>;
  };
  const serviceDurations = (slot.appointment_services || [])
    .map(item => item.services?.duration_minutes || 0)
    .filter(Boolean);
  return serviceDurations.length > 0
    ? serviceDurations.reduce((total, duration) => total + duration, 0)
    : slot.duration_minutes || slot.services?.duration_minutes || 30;
};

const GroupBookingFlow: React.FC<GroupBookingFlowProps> = ({ userId }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<BookingService[]>([]);
  const [professionals, setProfessionals] = useState<BookingProfessional[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [participants, setParticipants] = useState<BookingParticipant[]>([createParticipant('Eu')]);
  const [activeParticipantId, setActiveParticipantId] = useState('');
  const [scheduleIndex, setScheduleIndex] = useState(0);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [savedContact, setSavedContact] = useState({ name: '', phone: '', email: '' });
  const [contactSource, setContactSource] = useState<'account' | 'manual'>('account');

  useEffect(() => {
    setActiveParticipantId(current => current || participants[0].id);
  }, [participants]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const [settingsResult, servicesResult, professionalsResult, hoursResult, profileResult] = await Promise.all([
          supabase.from('barbershop_settings').select('buffer_minutes').eq('user_id', userId).single(),
          supabase.from('services').select('id, name, description, price, duration_minutes, image_url').eq('user_id', userId).eq('active', true).order('name'),
          supabase.from('profiles').select('id, display_name, email, avatar_url').eq('user_id', userId).eq('role', 'barbeiro').eq('active', true).order('display_name'),
          supabase.from('business_hours').select('day_of_week, open_time, close_time, is_closed').eq('user_id', userId),
          user
            ? supabase.from('client_profiles').select('full_name, phone').eq('user_id', user.id).eq('barbershop_user_id', userId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        if (settingsResult.error) throw settingsResult.error;
        if (servicesResult.error) throw servicesResult.error;
        if (professionalsResult.error) throw professionalsResult.error;
        if (hoursResult.error) throw hoursResult.error;
        if (profileResult.error) throw profileResult.error;
        setBufferMinutes(settingsResult.data?.buffer_minutes || 0);
        setServices((servicesResult.data || []).map(service => ({
          ...service,
          description: service.description || '',
          price: Number(service.price),
          image_url: service.image_url || undefined,
        })));
        setProfessionals((professionalsResult.data || []).map(professional => ({
          id: professional.id,
          name: professional.display_name || professional.email || 'Profissional',
          avatar: professional.avatar_url || undefined,
        })));
        setBusinessHours(hoursResult.data || []);

        const emailFallbackName = user?.email?.split('@')[0] || 'Cliente';
        const responsibleName = profileResult.data?.full_name
          || user?.user_metadata?.full_name
          || `${emailFallbackName.charAt(0).toUpperCase()}${emailFallbackName.slice(1)}`;
        const accountContact = {
          name: responsibleName,
          phone: profileResult.data?.phone || user?.user_metadata?.phone || '',
          email: user?.email || '',
        };
        setSavedContact(accountContact);
        setContact(accountContact);
        if (responsibleName) {
          setParticipants(current => current.map((participant, index) =>
            index === 0 && participant.name === 'Você' ? { ...participant, name: responsibleName } : participant
          ));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível carregar o agendamento.';
        toast({ title: 'Erro ao carregar', description: message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast, userId]);

  const serviceMap = useMemo(() => new Map(services.map(service => [service.id, service])), [services]);
  const professionalMap = useMemo(() => new Map(professionals.map(professional => [professional.id, professional])), [professionals]);

  const participantTotal = useCallback((participant: BookingParticipant) =>
    participant.serviceIds.reduce((sum, serviceId) => sum + (serviceMap.get(serviceId)?.price || 0), 0), [serviceMap]);

  const participantDuration = useCallback((participant: BookingParticipant) =>
    participant.serviceIds.reduce((sum, serviceId) => sum + (serviceMap.get(serviceId)?.duration_minutes || 0), 0), [serviceMap]);

  const groupTotal = useMemo(() => participants.reduce((sum, participant) => sum + participantTotal(participant), 0), [participants, participantTotal]);
  const activeParticipant = participants.find(participant => participant.id === activeParticipantId) || participants[0];
  const scheduledParticipant = participants[scheduleIndex] || participants[0];

  const updateParticipant = (id: string, changes: Partial<BookingParticipant>) => {
    setParticipants(current => current.map(participant => participant.id === id ? { ...participant, ...changes } : participant));
  };

  const addParticipant = () => {
    const participant = createParticipant();
    setParticipants(current => [...current, participant]);
    setActiveParticipantId(participant.id);
  };

  const removeParticipant = (id: string) => {
    if (participants.length === 1) return;
    const next = participants.filter(participant => participant.id !== id);
    setParticipants(next);
    setActiveParticipantId(next[0].id);
    setScheduleIndex(0);
  };

  const toggleService = (participantId: string, serviceId: string) => {
    const participant = participants.find(item => item.id === participantId);
    if (!participant) return;
    const serviceIds = participant.serviceIds.includes(serviceId)
      ? participant.serviceIds.filter(id => id !== serviceId)
      : [...participant.serviceIds, serviceId];
    updateParticipant(participantId, { serviceIds, time: '' });
  };

  const getDayWindow = useCallback((date: Date) => {
    const configured = businessHours.find(item => item.day_of_week === date.getDay());
    if (configured?.is_closed) return null;
    return {
      start: configured?.open_time?.slice(0, 5) || '09:00',
      end: configured?.close_time?.slice(0, 5) || '19:00',
    };
  }, [businessHours]);

  const fetchSlotsFor = useCallback(async (participant: BookingParticipant) => {
    if (!participant.date || !participant.professionalId || participant.serviceIds.length === 0) {
      setSlots([]);
      return;
    }

    const dayWindow = getDayWindow(participant.date);
    if (!dayWindow) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      const date = format(participant.date, 'yyyy-MM-dd');
      const dayStart = `${date}T00:00:00`;
      const dayEnd = `${date}T23:59:59`;
      const { data: availabilityData, error: availabilityError } = await supabase.rpc('get_booking_availability', {
        _barbershop_user_id: userId,
        _professional_id: participant.professionalId,
        _date: date,
      });
      if (availabilityError) throw availabilityError;
      const availability = availabilityData as {
        appointments?: Array<{ appointment_time: string; duration_minutes: number }>;
        blockedSlots?: Array<{ start_datetime: string; end_datetime: string }>;
      } | null;
      const existingAppointments = availability?.appointments || [];
      const blockedSlots = availability?.blockedSlots || [];
      const duration = participantDuration(participant);
      const start = minutesFromTime(dayWindow.start);
      const end = minutesFromTime(dayWindow.end);
      const nextSlots: AvailableSlot[] = [];

      for (let minute = start; minute + duration <= end; minute += 30) {
        const time = `${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
        const slotDate = new Date(`${date}T${time}:00`);
        const isPast = slotDate.getTime() <= Date.now();
        const isBlocked = blockedSlots.some(block =>
          blockedPeriodConflict(slotDate, duration, block.start_datetime, block.end_datetime)
        );
        const isDatabaseConflict = existingAppointments.some(appointment =>
          appointmentsConflict(minute, duration, minutesFromTime(appointment.appointment_time), existingAppointmentDuration(appointment), bufferMinutes)
        );
        const isGroupConflict = participants.some(other => {
          if (other.id === participant.id || !other.date || !other.time) return false;
          return other.professionalId === participant.professionalId
            && format(other.date, 'yyyy-MM-dd') === date
            && appointmentsConflict(minute, duration, minutesFromTime(other.time), participantDuration(other), bufferMinutes);
        });
        const reason = isPast ? 'Horário passado' : isBlocked ? 'Profissional indisponível' : isDatabaseConflict || isGroupConflict ? 'Horário ocupado' : undefined;
        nextSlots.push({ time, available: !reason, reason });
      }

      setSlots(nextSlots);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível consultar as vagas.';
      toast({ title: 'Erro ao consultar vagas', description: message, variant: 'destructive' });
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [bufferMinutes, getDayWindow, participantDuration, participants, toast, userId]);

  useEffect(() => {
    if (step === 2 && scheduledParticipant) fetchSlotsFor(scheduledParticipant);
  }, [fetchSlotsFor, scheduledParticipant, step]);

  const validatePeople = () => {
    const incomplete = participants.find(participant => !participant.name.trim() || participant.serviceIds.length === 0);
    if (incomplete) {
      setActiveParticipantId(incomplete.id);
      toast({ title: 'Complete cada pessoa', description: 'Informe o nome e pelo menos um serviço para todos.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateSchedules = () => {
    const index = participants.findIndex(participant => !participant.professionalId || !participant.date || !participant.time);
    if (index >= 0) {
      setScheduleIndex(index);
      toast({ title: 'Falta escolher um horário', description: `Complete o atendimento de ${participants[index].name}.`, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validatePeople()) return;
    if (step === 2 && !validateSchedules()) return;
    setStep(current => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalizeBooking = async () => {
    if (submitting) return;
    if (!contact.name.trim() || !contact.phone.trim() || !contact.email.trim()) {
      toast({ title: 'Informe os dados do responsável', description: 'Nome, telefone e email são obrigatórios.', variant: 'destructive' });
      return;
    }
    if (!validatePeople() || !validateSchedules()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sua sessão expirou. Entre novamente para agendar.');

      const bookingGroupId = crypto.randomUUID();
      const { error: bookingError } = await supabase.rpc('book_group_appointments', {
        _barbershop_user_id: userId,
        _responsible: {
          name: contact.name.trim(),
          phone: contact.phone,
          email: contact.email.trim().toLowerCase(),
        },
        _participants: participants.map(participant => ({
          name: participant.name.trim(),
          relationship: participant.relationship,
          professionalId: participant.professionalId,
          date: format(participant.date!, 'yyyy-MM-dd'),
          time: participant.time,
          serviceIds: participant.serviceIds,
          notes: buildGroupBookingNotes({
            groupId: bookingGroupId,
            attendeeName: participant.name,
            relationship: participant.relationship,
            responsibleName: contact.name,
            notes,
          }),
        })),
        _notes: notes || null,
      });

      if (bookingError) {
        const friendly = translateBookingError(bookingError.message);
        if (friendly.refreshSlots && scheduledParticipant) {
          fetchSlotsFor(scheduledParticipant);
          setStep(2);
        }
        throw new Error(friendly.message);
      }

      setCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir o agendamento.';
      toast({ title: 'Agendamento não concluído', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-lg space-y-5 py-4">
        <Card className="overflow-hidden rounded-3xl border-emerald-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-extrabold">Horários solicitados</h1>
            <p className="mt-2 text-sm text-muted-foreground">Cada pessoa ganhou um atendimento próprio na agenda.</p>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {participants.map(participant => (
            <Card key={participant.id} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">{format(participant.date!, "dd 'de' MMM", { locale: ptBR })} às {participant.time} · {professionalMap.get(participant.professionalId)?.name}</p>
                  </div>
                  <span className="font-extrabold text-primary">{currency.format(participantTotal(participant))}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-4">
          <span className="font-semibold">Total do grupo</span>
          <span className="text-xl font-extrabold text-primary">{currency.format(groupTotal)}</span>
        </div>
        <Button className="h-12 w-full rounded-xl font-bold" onClick={() => { window.location.href = `/b/${userId}/agendamentos`; }}>
          Ver meus horários
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 pb-28">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Agendamento para uma ou mais pessoas</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Monte sua agenda em grupo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha os serviços e confirme uma vaga para cada pessoa.</p>
      </header>

      <ol className="grid grid-cols-3 gap-2" aria-label="Etapas do agendamento">
        {STEPS.map(item => (
          <li key={item.id} className={cn('rounded-xl border p-2.5', step === item.id ? 'border-primary bg-primary/10' : item.id < step ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : 'bg-card')}>
            <div className="flex items-center gap-2">
              <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', step === item.id ? 'bg-primary text-primary-foreground' : item.id < step ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
                {item.id < step ? <Check className="h-3.5 w-3.5" /> : item.id}
              </span>
              <span className="truncate text-xs font-bold">{item.label}</span>
            </div>
          </li>
        ))}
      </ol>

      {step === 1 && activeParticipant && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {participants.map((participant, index) => (
              <Button key={participant.id} variant={participant.id === activeParticipant.id ? 'default' : 'outline'} className="h-11 shrink-0 rounded-xl" onClick={() => setActiveParticipantId(participant.id)}>
                <UserRound className="mr-2 h-4 w-4" />
                {participant.name.trim() || `Pessoa ${index + 1}`}
              </Button>
            ))}
            <Button variant="outline" className="h-11 shrink-0 rounded-xl border-dashed" onClick={addParticipant}>
              <Plus className="mr-2 h-4 w-4" /> Outra pessoa
            </Button>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Quem será atendido?</p>
                  <p className="text-xs text-muted-foreground">O acesso e os contatos continuam com você.</p>
                </div>
                {participants.length > 1 && <Button variant="ghost" size="icon" aria-label="Remover pessoa" onClick={() => removeParticipant(activeParticipant.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`name-${activeParticipant.id}`}>Nome da pessoa</Label>
                  <Input id={`name-${activeParticipant.id}`} className="h-12 rounded-xl" value={activeParticipant.name} onChange={event => updateParticipant(activeParticipant.id, { name: event.target.value })} placeholder="Ex.: Benício" />
                </div>
                <div className="space-y-1.5">
                  <Label>Quem é essa pessoa?</Label>
                  <Select value={activeParticipant.relationship} onValueChange={relationship => updateParticipant(activeParticipant.id, { relationship })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{RELATIONSHIPS.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-bold">Serviços para {activeParticipant.name || 'esta pessoa'}</h2>
              <p className="text-sm text-muted-foreground">Os valores abaixo serão mostrados separadamente na revisão.</p>
            </div>
            {services.length === 0 ? (
              <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">Nenhum serviço disponível.</Card>
            ) : services.map(service => {
              const selected = activeParticipant.serviceIds.includes(service.id);
              return (
                <button key={service.id} type="button" onClick={() => toggleService(activeParticipant.id, service.id)} className={cn('flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition', selected ? 'border-primary ring-2 ring-primary/10' : 'hover:border-primary/40')}>
                  {service.image_url ? <img src={service.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted"><Scissors className="h-6 w-6 text-muted-foreground" /></span>}
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{service.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{service.duration_minutes} min</span>
                    <span className="mt-1 block font-extrabold text-primary">{currency.format(service.price)}</span>
                  </span>
                  <Checkbox checked={selected} aria-label={`Selecionar ${service.name}`} />
                </button>
              );
            })}
          </section>

          <div className="rounded-2xl bg-muted/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Subtotal de {activeParticipant.name || 'esta pessoa'}</span>
              <span className="text-lg font-extrabold text-primary">{currency.format(participantTotal(activeParticipant))}</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && scheduledParticipant && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {participants.map((participant, index) => {
              const ready = participant.professionalId && participant.date && participant.time;
              return (
                <Button key={participant.id} variant={scheduleIndex === index ? 'default' : 'outline'} className="h-11 shrink-0 rounded-xl" onClick={() => setScheduleIndex(index)}>
                  {ready ? <Check className="mr-2 h-4 w-4" /> : <Clock className="mr-2 h-4 w-4" />}{participant.name}
                </Button>
              );
            })}
          </div>

          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Atendimento {scheduleIndex + 1} de {participants.length}</p>
                  <h2 className="text-xl font-extrabold">{scheduledParticipant.name}</h2>
                  <p className="text-sm text-muted-foreground">{scheduledParticipant.serviceIds.map(id => serviceMap.get(id)?.name).filter(Boolean).join(' + ')}</p>
                </div>
                <span className="whitespace-nowrap font-extrabold text-primary">{currency.format(participantTotal(scheduledParticipant))}</span>
              </div>

              <div className="space-y-1.5">
                <Label>Profissional</Label>
                <Select value={scheduledParticipant.professionalId} onValueChange={professionalId => updateParticipant(scheduledParticipant.id, { professionalId, time: '' })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Escolha quem vai atender" /></SelectTrigger>
                  <SelectContent>{professionals.map(professional => <SelectItem key={professional.id} value={professional.id}>{professional.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Data</Label>
                <Calendar
                  mode="single"
                  selected={scheduledParticipant.date}
                  onSelect={date => {
                    updateParticipant(scheduledParticipant.id, { date, time: '' });
                    if (date && scheduleIndex === 0) {
                      setParticipants(current => current.map((participant, index) => index > 0 && !participant.date ? { ...participant, date } : participant));
                    }
                  }}
                  disabled={date => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return isBefore(date, today) || getDayWindow(date) === null;
                  }}
                  locale={ptBR}
                  className="w-full rounded-xl border"
                />
                {scheduleIndex === 0 && <p className="mt-2 text-xs text-muted-foreground">A primeira data é sugerida para as outras pessoas; você pode alterar depois.</p>}
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Horários disponíveis</h3>
                <p className="text-xs text-muted-foreground">Tempo reservado: {participantDuration(scheduledParticipant)} min</p>
              </div>
              {loadingSlots && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            {!scheduledParticipant.professionalId || !scheduledParticipant.date ? (
              <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">Escolha o profissional e a data para consultar as vagas.</Card>
            ) : slots.filter(slot => slot.available).length === 0 && !loadingSlots ? (
              <Card className="rounded-2xl border-dashed p-6 text-center"><Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" /><p className="font-semibold">Sem vagas para este atendimento</p><p className="mt-1 text-sm text-muted-foreground">Tente outra data ou profissional.</p></Card>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.filter(slot => slot.available).map(slot => (
                  <Button key={slot.time} variant={scheduledParticipant.time === slot.time ? 'default' : 'outline'} className="h-12 rounded-xl text-base font-bold" onClick={() => updateParticipant(scheduledParticipant.id, { time: slot.time })}>{slot.time}</Button>
                ))}
              </div>
            )}
          </section>

          <div className="flex gap-2">
            {scheduleIndex > 0 && <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setScheduleIndex(index => index - 1)}>Pessoa anterior</Button>}
            {scheduleIndex < participants.length - 1 && <Button className="h-11 flex-1 rounded-xl" disabled={!scheduledParticipant.time} onClick={() => setScheduleIndex(index => index + 1)}>Próxima pessoa <ArrowRight className="ml-2 h-4 w-4" /></Button>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UsersRound className="h-5 w-5" /></span><div><h2 className="font-bold">Resumo do grupo</h2><p className="text-sm text-muted-foreground">{participants.length} {participants.length === 1 ? 'atendimento' : 'atendimentos'} na agenda</p></div></div>
              <div className="space-y-3">
                {participants.map(participant => (
                  <div key={participant.id} className="rounded-xl border bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{participant.name} <span className="font-normal text-muted-foreground">· {participant.relationship}</span></p><p className="mt-1 text-sm text-muted-foreground">{format(participant.date!, "dd/MM/yyyy", { locale: ptBR })} às {participant.time} · {professionalMap.get(participant.professionalId)?.name}</p></div><span className="whitespace-nowrap font-extrabold text-primary">{currency.format(participantTotal(participant))}</span></div>
                    <div className="mt-3 space-y-1 border-t pt-2">
                      {participant.serviceIds.map(id => { const service = serviceMap.get(id)!; return <div key={id} className="flex justify-between text-sm"><span>{service.name}</span><span className="text-muted-foreground">{currency.format(service.price)}</span></div>; })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t pt-4"><span className="font-bold">Total geral</span><span className="text-2xl font-extrabold text-primary">{currency.format(groupTotal)}</span></div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-4">
              <div><h2 className="font-bold">Responsável pelo agendamento</h2><p className="text-sm text-muted-foreground">Confirmações de todas as pessoas serão enviadas para este contato.</p></div>
              <div className="space-y-1.5">
                <Label>Quem receberá as confirmações?</Label>
                <Select
                  value={contactSource}
                  onValueChange={value => {
                    const source = value as 'account' | 'manual';
                    setContactSource(source);
                    setContact(source === 'account' ? savedContact : { name: '', phone: '', email: '' });
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Eu — dono deste acesso</SelectItem>
                    <SelectItem value="manual">Outra pessoa responsável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {contactSource === 'account' ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><ShieldCheck className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="font-bold">{contact.name || 'Titular do acesso'}</p>
                      <p className="truncate text-sm text-muted-foreground">{contact.email || 'Email não cadastrado'}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone || 'Telefone não cadastrado'}</p>
                    </div>
                  </div>
                  {!contact.phone && (
                    <div className="mt-3 space-y-1.5">
                      <Label htmlFor="account-phone">Complete apenas seu telefone</Label>
                      <Input id="account-phone" inputMode="tel" className="h-11 rounded-xl bg-background" value={contact.phone} onChange={event => setContact(current => ({ ...current, phone: event.target.value }))} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border p-4">
                  <div className="space-y-1.5"><Label htmlFor="contact-name">Nome</Label><Input id="contact-name" className="h-12 rounded-xl" value={contact.name} onChange={event => setContact(current => ({ ...current, name: event.target.value }))} /></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label htmlFor="contact-phone">Telefone</Label><Input id="contact-phone" inputMode="tel" className="h-12 rounded-xl" value={contact.phone} onChange={event => setContact(current => ({ ...current, phone: event.target.value }))} /></div>
                    <div className="space-y-1.5"><Label htmlFor="contact-email">Email</Label><Input id="contact-email" type="email" className="h-12 rounded-xl" value={contact.email} onChange={event => setContact(current => ({ ...current, email: event.target.value }))} /></div>
                  </div>
                </div>
              )}
              <div className="space-y-1.5"><Label htmlFor="group-notes">Observações para o estabelecimento</Label><Textarea id="group-notes" rows={3} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Ex.: meu filho tem sensibilidade a máquina." /></div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[72px] z-30 border-t bg-background/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:sticky sm:bottom-0 sm:rounded-2xl sm:border">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Button variant="outline" className="h-12 rounded-xl px-4" disabled={step === 1 || submitting} onClick={() => setStep(current => current - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
          <div className="min-w-0 flex-1 text-right"><p className="text-xs text-muted-foreground">Total do grupo</p><p className="truncate text-lg font-extrabold text-primary">{currency.format(groupTotal)}</p></div>
          {step < 3 ? <Button className="h-12 rounded-xl px-5 font-bold" onClick={goNext}>Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button className="h-12 rounded-xl px-5 font-bold" disabled={submitting} onClick={finalizeBooking}>{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />} Confirmar</Button>}
        </div>
      </div>
    </div>
  );
};

export default GroupBookingFlow;
