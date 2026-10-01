export interface CommissionRuleInput {
  barber_id: string | null;
  service_id: string | null;
  commission_type: string;
  commission_value: number;
}

/** Reuses the established precedence; input is already scoped to the owner. */
export function resolveCommissionRate(rules: readonly CommissionRuleInput[], barberId: string | null, serviceId: string | null) {
  const rule = (barberId && serviceId ? rules.find(r => r.barber_id === barberId && r.service_id === serviceId) : undefined)
    || (barberId ? rules.find(r => r.barber_id === barberId && !r.service_id) : undefined)
    || (serviceId ? rules.find(r => !r.barber_id && r.service_id === serviceId) : undefined)
    || rules.find(r => !r.barber_id && !r.service_id);
  const type = rule?.commission_type || 'percentage';
  const value = rule?.commission_value ?? 40;
  if (!['percentage', 'fixed'].includes(type) || !Number.isFinite(value) || value < 0 || (type === 'percentage' && value > 100)) {
    throw new Error('Regra de comissão inválida. Revise os percentuais e valores cadastrados.');
  }
  return { type: type as 'percentage' | 'fixed', value };
}

export function commissionAmount(rate: { type: 'percentage' | 'fixed'; value: number }, price: number) {
  if (!Number.isFinite(price) || price < 0) throw new Error('Base de comissão inválida.');
  return Math.round(((rate.type === 'percentage' ? price * rate.value / 100 : rate.value) + Number.EPSILON) * 100) / 100;
}
