export interface PlatformPaymentRevenueRecord {
  amount: number | null;
  status: string;
  created_at: string | null;
}

export interface MonthlyPlatformRevenue {
  month: string;
  revenue: number;
}

/** Returns the last six calendar months of paid revenue using the browser's local timezone. */
export function buildMonthlyPlatformRevenue(
  payments: PlatformPaymentRevenueRecord[],
  now = new Date(),
): MonthlyPlatformRevenue[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      start,
      key: `${start.getFullYear()}-${start.getMonth()}`,
      month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(start).replace('.', ''),
      revenue: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  for (const payment of payments) {
    if (payment.status !== 'paid' || !payment.created_at) continue;
    const createdAt = new Date(payment.created_at);
    if (Number.isNaN(createdAt.getTime())) continue;

    const month = monthByKey.get(`${createdAt.getFullYear()}-${createdAt.getMonth()}`);
    if (month) month.revenue += Number(payment.amount || 0);
  }

  return months.map(({ month, revenue }) => ({ month, revenue }));
}
