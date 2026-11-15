import { describe, expect, it } from 'vitest';
import { buildMonthlyPlatformRevenue } from './platformRevenue';

describe('buildMonthlyPlatformRevenue', () => {
  it('soma pagamentos pagos reais nos últimos seis meses e ignora pendentes e datas inválidas', () => {
    const now = new Date(2026, 10, 14, 12);
    const rows = buildMonthlyPlatformRevenue([
      { amount: 89.9, status: 'paid', created_at: '2026-11-02T12:00:00-03:00' },
      { amount: 44.9, status: 'paid', created_at: '2026-11-13T12:00:00-03:00' },
      { amount: 149.9, status: 'pending', created_at: '2026-11-05T12:00:00-03:00' },
      { amount: 500, status: 'paid', created_at: 'not-a-date' },
      { amount: 500, status: 'paid', created_at: '2026-06-30T12:00:00-03:00' },
    ], now);

    expect(rows).toHaveLength(6);
    expect(rows[0].revenue).toBe(500);
    expect(rows[5].revenue).toBeCloseTo(134.8);
  });

  it('preserva meses sem pagamento com receita zero', () => {
    const rows = buildMonthlyPlatformRevenue([], new Date(2026, 10, 14, 12));
    expect(rows.map(({ revenue }) => revenue)).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
