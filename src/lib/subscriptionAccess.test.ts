import { describe, expect, it } from 'vitest';
import { getSubscriptionAccessDecision } from './subscriptionAccess';

const now = new Date('2026-10-15T12:00:00.000Z');

describe('getSubscriptionAccessDecision', () => {
  it('allows an active subscription before its end date', () => {
    expect(getSubscriptionAccessDecision({ status: 'active', end_date: '2026-10-22T12:00:00.000Z' }, now)).toEqual({
      allowed: true,
      reason: 'active',
    });
  });

  it.each(['suspended', 'cancelled', 'expired', 'pending_payment'] as const)(
    'blocks a %s subscription',
    (status) => {
      expect(getSubscriptionAccessDecision({ status, end_date: '2026-10-22T12:00:00.000Z' }, now)).toEqual({
        allowed: false,
        reason: status,
      });
    },
  );

  it('treats the legacy paused status as suspended', () => {
    expect(getSubscriptionAccessDecision({ status: 'paused', end_date: '2026-10-22T12:00:00.000Z' }, now)).toEqual({
      allowed: false,
      reason: 'suspended',
    });
  });

  it('blocks an active trial when its end date has passed', () => {
    expect(getSubscriptionAccessDecision({ status: 'active', end_date: '2026-10-14T12:00:00.000Z' }, now)).toEqual({
      allowed: false,
      reason: 'expired',
    });
  });

  it('blocks access when the business has no subscription', () => {
    expect(getSubscriptionAccessDecision(null, now)).toEqual({ allowed: false, reason: 'missing' });
  });
});
