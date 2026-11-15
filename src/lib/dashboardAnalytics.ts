export type ProductRevenueItem = {
  product_id: string | null;
  total_price: number | null;
};

export type DashboardProduct = {
  id: string;
  name: string | null;
};

export type AppointmentHeatmapSource = {
  appointment_date: string;
  appointment_time: string;
  status: string;
};

export type BookingHeatmapRow = {
  weekday: number;
  label: string;
  counts: number[];
};

const weekdayLabels = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function buildProductRevenueRanking(
  items: ProductRevenueItem[],
  products: DashboardProduct[],
  limit = 5,
) {
  const nameById = new Map(products.map((product) => [product.id, product.name?.trim() || 'Produto sem nome']));
  const totals = new Map<string, number>();

  for (const item of items) {
    if (!item.product_id) continue;
    const name = nameById.get(item.product_id);
    if (!name) continue;
    totals.set(name, (totals.get(name) || 0) + Number(item.total_price || 0));
  }

  return [...totals.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, Math.max(0, limit));
}

export function buildBookingHeatmap(appointments: AppointmentHeatmapSource[]) {
  const counts = new Map<string, number>();
  const activeHours = new Set<number>();

  for (const appointment of appointments) {
    if (appointment.status === 'cancelled' || appointment.status === 'no_show') continue;
    const [year, month, day] = appointment.appointment_date.split('-').map(Number);
    const hour = Number(appointment.appointment_time.slice(0, 2));
    if (![year, month, day, hour].every(Number.isInteger) || month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23) continue;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) continue;
    const weekday = date.getDay();
    activeHours.add(hour);
    const key = `${weekday}:${hour}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const observedHours = [...activeHours].sort((a, b) => a - b);
  const hours = observedHours.length
    ? Array.from({ length: observedHours[observedHours.length - 1] - observedHours[0] + 1 }, (_, index) => observedHours[0] + index)
    : [];
  const rows: BookingHeatmapRow[] = weekdayLabels.map((label, weekday) => ({
    weekday,
    label,
    counts: hours.map((hour) => counts.get(`${weekday}:${hour}`) || 0),
  }));

  return {
    hours,
    rows,
    maxCount: Math.max(0, ...counts.values()),
  };
}
