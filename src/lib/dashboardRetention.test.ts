import { describe, expect, it } from 'vitest';
import { calculateReturnMetrics } from './dashboardRetention';

describe('calculateReturnMetrics', () => {
  it('counts returning clients only from completed visits', () => {
    expect(calculateReturnMetrics([
      { client_id: 'a', appointment_date: '2026-10-20', status: 'completed' },
      { client_id: 'a', appointment_date: '2026-11-10', status: 'completed' },
      { client_id: 'b', appointment_date: '2026-11-11', status: 'completed' },
      { client_id: 'c', appointment_date: '2026-10-18', status: 'no_show' },
      { client_id: 'c', appointment_date: '2026-11-12', status: 'completed' },
      { client_id: 'b', appointment_date: '2026-11-13', status: 'cancelled' },
    ], '2026-11-01')).toEqual({ currentClients: 3, returningClients: 1, returnRate: 33 });
  });

  it('returns zero metrics when there are no completed visits in the period', () => {
    expect(calculateReturnMetrics([
      { client_id: 'a', appointment_date: '2026-11-12', status: 'pending' },
      { client_id: 'b', appointment_date: '2026-10-12', status: 'completed' },
    ], '2026-11-01')).toEqual({ currentClients: 0, returningClients: 0, returnRate: 0 });
  });
});
