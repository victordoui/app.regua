import { describe, expect, it } from 'vitest';
import { calculateAttendanceRate, calculateCompletionRate } from './dashboardAttendance';

describe('calculateCompletionRate', () => {
  it('considers only closed appointments and includes cancellations and no-shows', () => {
    expect(calculateCompletionRate([
      ...Array.from({ length: 5 }, () => ({ status: 'completed' })),
      { status: 'cancelled' },
      { status: 'no_show' },
      { status: 'confirmed' },
      { status: 'pending' },
    ])).toBe(71);
  });

  it('returns zero when all appointments are still open', () => {
    expect(calculateCompletionRate([{ status: 'confirmed' }, { status: 'pending' }])).toBe(0);
  });
});

describe('calculateAttendanceRate', () => {
  it('compares completed visits with no-shows and excludes cancellations or open bookings', () => {
    expect(calculateAttendanceRate([
      ...Array.from({ length: 8 }, () => ({ status: 'completed' })),
      ...Array.from({ length: 2 }, () => ({ status: 'no_show' })),
      ...Array.from({ length: 5 }, () => ({ status: 'cancelled' })),
      ...Array.from({ length: 3 }, () => ({ status: 'confirmed' })),
    ])).toBe(80);
  });

  it('returns zero when there are no completed visits or no-shows', () => {
    expect(calculateAttendanceRate([{ status: 'pending' }, { status: 'cancelled' }])).toBe(0);
  });
});
