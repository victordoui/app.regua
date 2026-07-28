import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { addDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { translateBookingError } from '@/lib/bookingErrors';
import { appointmentsConflict, minutesFromTime, blockedPeriodConflict } from '@/lib/bookingAvailability';

interface ClientRescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barbershopUserId: string;
  appointmentId: string;
  professionalId: string | null;
  durationMinutes: number;
  onRescheduled: () => void;
}

interface AvailabilityPayload {
  appointments: { appointment_time: string; duration_minutes: number }[];
  blockedSlots: { start_datetime: string; end_datetime: string }[];
}

const ClientRescheduleDialog: React.FC<ClientRescheduleDialogProps> = ({
  open,
  onOpenChange,
  barbershopUserId,
  appointmentId,
  professionalId,
  durationMinutes,
  onRescheduled,
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSlots = useCallback(async (selected: Date) => {
    if (!professionalId) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const dateStr = format(selected, 'yyyy-MM-dd');
      const [hoursRes, availabilityRes, settingsRes] = await Promise.all([
        supabase
          .from('business_hours')
          .select('open_time, close_time, is_closed')
          .eq('user_id', barbershopUserId)
          .eq('day_of_week', selected.getDay())
          .maybeSingle(),
        supabase.rpc('get_booking_availability', {
          _barbershop_user_id: barbershopUserId,
          _professional_id: professionalId,
          _date: dateStr,
        }),
        supabase
          .from('barbershop_settings')
          .select('buffer_minutes')
          .eq('user_id', barbershopUserId)
          .maybeSingle(),
      ]);

      const hours = hoursRes.data;
      if (!hours || hours.is_closed || !hours.open_time || !hours.close_time) {
        setSlots([]);
        return;
      }

      if (availabilityRes.error) throw new Error(availabilityRes.error.message);
      const availability = (availabilityRes.data ?? { appointments: [], blockedSlots: [] }) as unknown as AvailabilityPayload;
      const buffer = settingsRes.data?.buffer_minutes ?? 0;

      const openMin = minutesFromTime(hours.open_time);
      const closeMin = minutesFromTime(hours.close_time);
      const available: string[] = [];

      for (let start = openMin; start + durationMinutes <= closeMin; start += 30) {
        const slotDate = new Date(selected);
        slotDate.setHours(Math.floor(start / 60), start % 60, 0, 0);
        if (slotDate.getTime() <= Date.now()) continue;

        const busy = availability.appointments.some(item =>
          appointmentsConflict(start, durationMinutes, minutesFromTime(item.appointment_time), item.duration_minutes || 30, buffer),
        );
        const blocked = availability.blockedSlots.some(item =>
          blockedPeriodConflict(slotDate, durationMinutes, item.start_datetime, item.end_datetime),
        );

        if (!busy && !blocked) {
          available.push(`${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`);
        }
      }

      setSlots(available);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar horários.';
      toast({ title: 'Não foi possível carregar horários', description: translateBookingError(message).message, variant: 'destructive' });
    } finally {
      setLoadingSlots(false);
    }
  }, [barbershopUserId, durationMinutes, professionalId, toast]);

  useEffect(() => {
    if (!open) {
      setDate(undefined);
      setTime('');
      setSlots([]);
    }
  }, [open]);

  useEffect(() => {
    if (open && date) loadSlots(date);
  }, [open, date, loadSlots]);

  const handleConfirm = async () => {
    if (!date || !time || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc('reschedule_client_appointment', {
        _appointment_id: appointmentId,
        _date: format(date, 'yyyy-MM-dd'),
        _time: time,
      });
      if (error) throw new Error(translateBookingError(error.message).message);

      toast({ title: 'Agendamento remarcado', description: `Novo horário: ${format(date, "dd 'de' MMMM", { locale: ptBR })} às ${time}.` });
      onOpenChange(false);
      onRescheduled();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível remarcar.';
      toast({ title: 'Erro ao remarcar', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remarcar agendamento</DialogTitle>
          <DialogDescription>Escolha uma nova data e horário disponível com o mesmo profissional.</DialogDescription>
        </DialogHeader>

        {!professionalId ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Este agendamento não tem profissional definido. Fale com a barbearia para remarcar.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-semibold">Nova data</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(value) => { setDate(value); setTime(''); }}
                disabled={(day) => day < startOfDay(new Date()) || day > addDays(new Date(), 90)}
                locale={ptBR}
                className="pointer-events-auto rounded-md border"
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold">Novo horário</Label>
              {!date ? (
                <p className="text-sm text-muted-foreground">Selecione uma data.</p>
              ) : loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando horários…</div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum horário livre nesta data.</p>
              ) : (
                <div className="grid max-h-40 grid-cols-4 gap-2 overflow-y-auto">
                  {slots.map(slot => (
                    <Button key={slot} type="button" size="sm" variant={time === slot ? 'default' : 'outline'} onClick={() => setTime(slot)}>
                      {slot}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Voltar</Button>
          <Button onClick={handleConfirm} disabled={!date || !time || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar remarcação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientRescheduleDialog;
