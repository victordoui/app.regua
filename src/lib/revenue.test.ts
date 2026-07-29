import { describe, it, expect } from 'vitest';
import { sumCompletedRevenue } from './revenue';

describe('sumCompletedRevenue', () => {
  it('soma apenas agendamentos concluídos', () => {
    expect(
      sumCompletedRevenue([
        { status: 'completed', total_price: 45 },
        { status: 'completed', total_price: 70 },
      ]),
    ).toBe(115);
  });

  it('ignora cancelados no faturamento', () => {
    expect(
      sumCompletedRevenue([
        { status: 'completed', total_price: 50 },
        { status: 'cancelled', total_price: 200 },
      ]),
    ).toBe(50);
  });

  it('ignora pendentes, confirmados e no-show', () => {
    expect(
      sumCompletedRevenue([
        { status: 'pending', total_price: 30 },
        { status: 'confirmed', total_price: 40 },
        { status: 'no_show', total_price: 60 },
      ]),
    ).toBe(0);
  });

  it('trata valores nulos e lista vazia', () => {
    expect(sumCompletedRevenue([])).toBe(0);
    expect(sumCompletedRevenue([{ status: 'completed', total_price: null }])).toBe(0);
  });
});
