export type TipRecord = { status: string; tip_amount: number | null };
export type DatedAppointmentRecord = { appointment_date: string; status: string };

export function sumCompletedTips(appointments: TipRecord[]): number {
  return appointments.reduce((total, appointment) => {
    if (appointment.status !== 'completed') return total;
    const tip = Number(appointment.tip_amount || 0);
    return Number.isFinite(tip) && tip > 0 ? total + tip : total;
  }, 0);
}

export function splitProfessionalAppointments<T extends DatedAppointmentRecord>(
  appointments: T[],
  today: string,
  monthStart: string,
  monthEnd: string,
) {
  const monthToDate = appointments.filter((appointment) => appointment.appointment_date >= monthStart && appointment.appointment_date <= today);
  const monthBookings = appointments.filter((appointment) => appointment.appointment_date >= monthStart
    && appointment.appointment_date <= monthEnd
    && !['cancelled', 'no_show'].includes(appointment.status));

  return {
    monthToDate,
    monthBookings,
    today: monthToDate.filter((appointment) => appointment.appointment_date === today
      && ['pending', 'confirmed', 'completed'].includes(appointment.status)),
    upcoming: appointments.filter((appointment) => appointment.appointment_date >= today
      && ['pending', 'confirmed'].includes(appointment.status)).slice(0, 5),
    noShows: monthToDate.filter((appointment) => appointment.status === 'no_show').length,
  };
}
