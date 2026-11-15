import { describe, expect, it } from 'vitest';
import { buildAppointmentReminderCalendar } from './appointmentReminder';

describe('buildAppointmentReminderCalendar', () => {
  const appointment = {
    id: 'qa-appointment-1',
    appointment_date: '2026-11-16',
    appointment_time: '10:30:00',
    duration_minutes: 45,
    service_name: 'Corte, barba; acabamento',
  };

  it('includes the 24-hour and 2-hour calendar alarms', () => {
    const calendar = buildAppointmentReminderCalendar(
      appointment,
      'QA Marshalls Barber',
      new Date('2026-11-15T12:00:00Z'),
    );

    expect(calendar).toContain('TRIGGER:-PT24H');
    expect(calendar).toContain('TRIGGER:-PT2H');
    expect(calendar.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(calendar).toContain('DTSTAMP:20261115T120000Z');
    expect(calendar).toContain('DTSTART;TZID=America/Sao_Paulo:20261116T103000');
    expect(calendar).toContain('DTEND;TZID=America/Sao_Paulo:20261116T111500');
  });

  it('escapes event text and applies a 15-minute minimum duration', () => {
    const calendar = buildAppointmentReminderCalendar(
      { ...appointment, duration_minutes: 10 },
      'QA Barber, Centro; Unidade',
      new Date('2026-11-15T12:00:00Z'),
    );

    expect(calendar).toContain('SUMMARY:Corte\\, barba\\; acabamento - QA Barber\\, Centro\\; Unidade');
    expect(calendar).toContain('DTEND;TZID=America/Sao_Paulo:20261116T104500');
  });
});
