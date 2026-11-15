export type AttendanceRecord = { status: string };

export function calculateCompletionRate(appointments: AttendanceRecord[]): number {
  const closedAppointments = appointments.filter((appointment) =>
    ['completed', 'cancelled', 'no_show'].includes(appointment.status),
  );
  if (!closedAppointments.length) return 0;

  const completedAppointments = closedAppointments.filter((appointment) => appointment.status === 'completed').length;
  return Math.round((completedAppointments / closedAppointments.length) * 100);
}

export function calculateAttendanceRate(appointments: AttendanceRecord[]): number {
  const outcomes = appointments.filter((appointment) => appointment.status === 'completed' || appointment.status === 'no_show');
  if (!outcomes.length) return 0;

  const attended = outcomes.filter((appointment) => appointment.status === 'completed').length;
  return Math.round((attended / outcomes.length) * 100);
}
