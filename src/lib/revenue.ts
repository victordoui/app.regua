export interface RevenueAppointment {
  status?: string | null;
  total_price?: number | null;
}

/**
 * Faturamento considera SOMENTE agendamentos concluídos.
 * Cancelados, pendentes, confirmados e no-show nunca entram no total.
 */
export const sumCompletedRevenue = (appointments: RevenueAppointment[] = []): number =>
  appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (a.total_price || 0), 0);
