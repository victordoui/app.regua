import { describe, expect, it } from 'vitest';
import { buildBookingHeatmap, buildProductRevenueRanking } from './dashboardAnalytics';

describe('buildProductRevenueRanking', () => {
  it('soma vendas por produto e ignora serviços e produtos ausentes', () => {
    const ranking = buildProductRevenueRanking([
      { product_id: 'pomade', total_price: 45 },
      { product_id: 'pomade', total_price: 15 },
      { product_id: 'shampoo', total_price: 32 },
      { product_id: null, total_price: 90 },
      { product_id: 'deleted', total_price: 200 },
    ], [
      { id: 'pomade', name: 'Pomada' },
      { id: 'shampoo', name: 'Shampoo' },
    ]);

    expect(ranking).toEqual([
      { name: 'Pomada', revenue: 60 },
      { name: 'Shampoo', revenue: 32 },
    ]);
  });

  it('limita a lista e desempata pelo nome em português', () => {
    const ranking = buildProductRevenueRanking([
      { product_id: 'z', total_price: 10 },
      { product_id: 'a', total_price: 10 },
      { product_id: 'm', total_price: 20 },
    ], [
      { id: 'z', name: 'Zinco' },
      { id: 'a', name: 'Água' },
      { id: 'm', name: 'Máscara' },
    ], 2);

    expect(ranking.map((item) => item.name)).toEqual(['Máscara', 'Água']);
  });
});

describe('buildBookingHeatmap', () => {
  it('organiza agendamentos por dia da semana e hora e ignora cancelados e faltas', () => {
    const heatmap = buildBookingHeatmap([
      { appointment_date: '2026-11-16', appointment_time: '09:00', status: 'completed' },
      { appointment_date: '2026-11-16', appointment_time: '09:30', status: 'confirmed' },
      { appointment_date: '2026-11-16', appointment_time: '15:00', status: 'confirmed' },
      { appointment_date: '2026-11-17', appointment_time: '09:00', status: 'completed' },
      { appointment_date: '2026-11-17', appointment_time: '10:00', status: 'cancelled' },
      { appointment_date: '2026-11-18', appointment_time: '10:00', status: 'no_show' },
    ]);

    expect(heatmap.hours).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(heatmap.rows.find((row) => row.label === 'Segunda-feira')?.counts).toEqual([2, 0, 0, 0, 0, 0, 1]);
    expect(heatmap.rows.find((row) => row.label === 'Terça-feira')?.counts).toEqual([1, 0, 0, 0, 0, 0, 0]);
    expect(heatmap.maxCount).toBe(2);
  });

  it('ignora horários inválidos e mantém os sete dias quando não há registros', () => {
    const heatmap = buildBookingHeatmap([
      { appointment_date: '2026-11-16', appointment_time: '99:00', status: 'confirmed' },
      { appointment_date: '2026-02-31', appointment_time: '11:00', status: 'confirmed' },
      { appointment_date: '2026-11-16', appointment_time: '11:00', status: 'cancelled' },
    ]);

    expect(heatmap.hours).toEqual([]);
    expect(heatmap.rows).toHaveLength(7);
    expect(heatmap.maxCount).toBe(0);
  });
});
