import { describe, expect, it } from 'vitest';
import { splitProfessionalAppointments, sumCompletedTips } from './professionalDashboardMetrics';

describe('sumCompletedTips', () => {
  it('sums only tips from completed appointments', () => {
    expect(sumCompletedTips([
      { status: 'completed', tip_amount: 12.5 },
      { status: 'completed', tip_amount: 7.5 },
      { status: 'confirmed', tip_amount: 100 },
      { status: 'cancelled', tip_amount: 20 },
    ])).toBe(20);
  });

  it('treats missing, zero, and invalid tip values as zero', () => {
    expect(sumCompletedTips([
      { status: 'completed', tip_amount: null },
      { status: 'completed', tip_amount: 0 },
      { status: 'completed', tip_amount: Number.NaN },
    ])).toBe(0);
  });
});

describe('splitProfessionalAppointments', () => {
  const monthStart = '2026-11-01';
  const monthEnd = '2026-11-30';
  const today = '2026-11-15';

  it('keeps upcoming appointments beyond today and into the next month', () => {
    const rows = [
      { id: 'today', appointment_date: today, status: 'confirmed' },
      { id: 'future-month', appointment_date: '2026-11-20', status: 'pending' },
      { id: 'future-next-month', appointment_date: '2026-12-02', status: 'confirmed' },
      { id: 'cancelled', appointment_date: '2026-11-18', status: 'cancelled' },
    ];

    const result = splitProfessionalAppointments(rows, today, monthStart, monthEnd);
    expect(result.upcoming.map((appointment) => appointment.id)).toEqual(['today', 'future-month', 'future-next-month']);
    expect(result.monthBookings.map((appointment) => appointment.id)).toEqual(['today', 'future-month']);
  });

  it('keeps monthly performance and no-shows limited to the current month through today', () => {
    const rows = [
      { id: 'past-completed', appointment_date: '2026-11-10', status: 'completed' },
      { id: 'past-no-show', appointment_date: '2026-11-12', status: 'no_show' },
      { id: 'future', appointment_date: '2026-11-20', status: 'confirmed' },
      { id: 'previous-month', appointment_date: '2026-10-31', status: 'completed' },
    ];

    const result = splitProfessionalAppointments(rows, today, monthStart, monthEnd);
    expect(result.monthToDate.map((appointment) => appointment.id)).toEqual(['past-completed', 'past-no-show']);
    expect(result.noShows).toBe(1);
  });

  it('limits the next-hours panel to five appointments', () => {
    const rows = Array.from({ length: 7 }, (_, index) => ({
      id: `future-${index}`,
      appointment_date: '2026-11-20',
      status: 'confirmed',
    }));
    expect(splitProfessionalAppointments(rows, today, monthStart, monthEnd).upcoming).toHaveLength(5);
  });
});
