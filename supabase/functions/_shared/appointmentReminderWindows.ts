export type ReminderLeadHours = 24 | 2;

const REMINDER_WINDOW_MS = 10 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Booking date/time values are wall-clock values in America/Sao_Paulo. */
export function appointmentInstant(date: string, time: string): Date | null {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const instant = new Date(`${date}T${normalizedTime}-03:00`);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/** Returns due reminders only during the final ten minutes of each target. */
export function dueReminderLeads(
  appointmentDate: string,
  appointmentTime: string,
  now: Date,
): ReminderLeadHours[] {
  const target = appointmentInstant(appointmentDate, appointmentTime);
  if (!target) return [];

  const remainingMs = target.getTime() - now.getTime();
  if (remainingMs <= 0) return [];

  return ([24, 2] as const).filter((leadHours) => {
    const leadMs = leadHours * HOUR_MS;
    return remainingMs <= leadMs && remainingMs > leadMs - REMINDER_WINDOW_MS;
  });
}

export function formatAppointmentInSaoPaulo(
  appointmentDate: string,
  appointmentTime: string,
) {
  const target = appointmentInstant(appointmentDate, appointmentTime);
  if (!target) return `${appointmentDate} ${appointmentTime}`;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(target);
}
