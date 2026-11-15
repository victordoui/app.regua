import { format, parseISO } from 'date-fns';

export interface AppointmentReminderInput {
  id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number | null;
  service_name: string | null;
}

const escapeIcsText = (value: string) => value
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/,/g, '\\,')
  .replace(/;/g, '\\;');

export function buildAppointmentReminderCalendar(
  appointment: AppointmentReminderInput,
  companyName: string,
  now = new Date(),
) {
  const start = parseISO(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + Math.max(15, appointment.duration_minutes || 30));
  const stamp = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");
  const serviceName = appointment.service_name || 'Atendimento';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VIZZU//Agenda do cliente//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@vizzu`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART;TZID=America/Sao_Paulo:${stamp(start)}`,
    `DTEND;TZID=America/Sao_Paulo:${stamp(end)}`,
    `SUMMARY:${escapeIcsText(`${serviceName} - ${companyName}`)}`,
    `DESCRIPTION:${escapeIcsText(`Atendimento em ${companyName}`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete: seu atendimento é amanhã.',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete: seu atendimento começa em 2 horas.',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
