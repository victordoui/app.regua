import { describe, expect, it } from 'vitest';
import { commissionAmount, resolveCommissionRate, type CommissionRuleInput } from './commissionCalculation';

const rule = (barber_id: string | null, service_id: string | null, commission_value: number, commission_type = 'percentage'): CommissionRuleInput => ({ barber_id, service_id, commission_value, commission_type });
describe('Commission calculations', () => {
  const rules = [rule(null, null, 25), rule(null, 'service', 30), rule('barber', null, 35), rule('barber', 'service', 50)];
  it('prioritizes professional + service over broader rules', () => expect(resolveCommissionRate(rules, 'barber', 'service').value).toBe(50));
  it('prioritizes the professional over the service', () => expect(resolveCommissionRate(rules.slice(0, 3), 'barber', 'service').value).toBe(35));
  it('uses a service rule for another professional', () => expect(resolveCommissionRate(rules, 'other', 'service').value).toBe(30));
  it('uses the global default before the legacy fallback', () => expect(resolveCommissionRate(rules, 'other', 'other').value).toBe(25));
  it('retains the legacy 40% fallback only when no applicable rule exists', () => expect(resolveCommissionRate([], null, null)).toEqual({ type: 'percentage', value: 40 }));
  it('does not apply another professional’s rule', () => expect(resolveCommissionRate([rule('other', 'service', 90)], 'barber', 'service').value).toBe(40));
  it('preserves zero-percent rules', () => expect(resolveCommissionRate([rule(null, null, 0)], null, null).value).toBe(0));
  it('calculates percentage using the persisted appointment value', () => expect(commissionAmount({ type: 'percentage', value: 40 }, 80)).toBe(32));
  it('uses fixed currency values without interpreting them as percentages', () => expect(commissionAmount(resolveCommissionRate([rule(null, null, 15, 'fixed')], null, null), 80)).toBe(15));
  it('rounds each commission to cents', () => expect(commissionAmount({ type: 'percentage', value: 35 }, 19.99)).toBe(7));
  it('rejects invalid rules instead of silently producing money values', () => expect(() => resolveCommissionRate([rule(null, null, -10)], null, null)).toThrow());
  it('rejects invalid prices', () => expect(() => commissionAmount({ type: 'percentage', value: 40 }, NaN)).toThrow());
});
