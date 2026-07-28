import { describe, expect, it } from 'vitest';
import { appointmentsConflict, blockedPeriodConflict } from './bookingAvailability';

describe('booking availability', () => {
  it('respeita o buffer antes e depois de outro atendimento', () => {
    expect(appointmentsConflict(9 * 60 + 30, 20, 10 * 60, 30, 10)).toBe(false);
    expect(appointmentsConflict(9 * 60 + 31, 20, 10 * 60, 30, 10)).toBe(true);
    expect(appointmentsConflict(10 * 60 + 40, 30, 10 * 60, 30, 10)).toBe(false);
    expect(appointmentsConflict(10 * 60 + 39, 30, 10 * 60, 30, 10)).toBe(true);
  });

  it('bloqueia atendimento que começa antes e atravessa uma ausência', () => {
    const slot = new Date('2026-07-28T09:30:00-03:00');
    expect(blockedPeriodConflict(slot, 60, '2026-07-28T10:00:00-03:00', '2026-07-28T11:00:00-03:00')).toBe(true);
    expect(blockedPeriodConflict(slot, 30, '2026-07-28T10:00:00-03:00', '2026-07-28T11:00:00-03:00')).toBe(false);
  });
});
