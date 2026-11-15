import { describe, expect, it } from 'vitest';
import { getEffectiveSubscriptionStatus } from './platformSubscriptionStatus';

const now = new Date('2026-11-14T15:00:00.000Z');

describe('getEffectiveSubscriptionStatus', () => {
  it('marks an active subscription as expired after its end date', () => {
    expect(getEffectiveSubscriptionStatus({
      status: 'active',
      end_date: '2026-11-14T14:59:59.000Z',
    }, now)).toBe('expired');
  });

  it('keeps an active subscription before its end date', () => {
    expect(getEffectiveSubscriptionStatus({
      status: 'active',
      end_date: '2026-11-14T15:00:01.000Z',
    }, now)).toBe('active');
  });

  it('does not replace an explicit non-active status', () => {
    expect(getEffectiveSubscriptionStatus({
      status: 'suspended',
      end_date: '2026-11-13T15:00:00.000Z',
    }, now)).toBe('suspended');
  });

  it('supports subscriptions without an end date', () => {
    expect(getEffectiveSubscriptionStatus({ status: 'active', end_date: null }, now)).toBe('active');
  });
});
