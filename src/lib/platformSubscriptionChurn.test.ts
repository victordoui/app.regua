import { describe, expect, it } from 'vitest';
import { calculatePlatformChurn, type ChurnHistoryEvent, type ChurnSubscription } from './platformSubscriptionChurn';

const start = new Date('2026-09-01T00:00:00Z');
const end = new Date('2026-10-01T00:00:00Z');

describe('calculatePlatformChurn', () => {
  it('uses the recorded status at period start and counts only later cancellations', () => {
    const subscriptions: ChurnSubscription[] = [
      { user_id: 'cancelled-during-period', created_at: '2026-07-01T12:00:00Z', updated_at: '2026-09-10T00:00:00Z', status: 'cancelled', end_date: '2026-12-01T00:00:00Z' },
      { user_id: 'created-in-period', created_at: '2026-09-08T12:00:00Z', updated_at: '2026-09-08T12:00:00Z', status: 'active', end_date: '2026-12-01T00:00:00Z' },
      { user_id: 'cancelled-before-period', created_at: '2026-07-02T12:00:00Z', updated_at: '2026-08-20T00:00:00Z', status: 'cancelled', end_date: null },
      { user_id: 'expired-before-period', created_at: '2026-07-03T12:00:00Z', updated_at: '2026-08-01T00:00:00Z', status: 'active', end_date: '2026-08-31T00:00:00Z' },
    ];
    const events: ChurnHistoryEvent[] = [
      { user_id: 'cancelled-during-period', event_type: 'snapshot', previous_status: null, status: 'active', end_date: '2026-12-01T00:00:00Z', created_at: '2026-08-01T00:00:00Z' },
      { user_id: 'cancelled-during-period', event_type: 'status_changed', previous_status: 'active', status: 'cancelled', end_date: '2026-12-01T00:00:00Z', created_at: '2026-09-10T00:00:00Z' },
      { user_id: 'created-in-period', event_type: 'created', previous_status: null, status: 'active', end_date: '2026-12-01T00:00:00Z', created_at: '2026-09-08T12:00:00Z' },
      { user_id: 'cancelled-before-period', event_type: 'status_changed', previous_status: 'active', status: 'cancelled', end_date: null, created_at: '2026-08-20T00:00:00Z' },
      { user_id: 'expired-before-period', event_type: 'snapshot', previous_status: null, status: 'active', end_date: '2026-08-31T00:00:00Z', created_at: '2026-08-01T00:00:00Z' },
    ];

    expect(calculatePlatformChurn(subscriptions, events, start, end)).toEqual({
      activeAtStart: 1,
      cancellations: 1,
      isComplete: true,
      rate: 100,
    });
  });

  it('marks the metric unavailable when a pre-existing subscription has no baseline event', () => {
    const result = calculatePlatformChurn(
      [{ user_id: 'legacy', created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z', status: 'active', end_date: null }],
      [{ user_id: 'legacy', event_type: 'snapshot', previous_status: null, status: 'active', end_date: null, created_at: '2026-09-05T00:00:00Z' }],
      start,
      end,
    );

    expect(result.isComplete).toBe(false);
    expect(result.rate).toBeNull();
  });

  it('uses a renewal event to evaluate the term at period start', () => {
    const result = calculatePlatformChurn(
      [{ user_id: 'renewed', created_at: '2026-07-01T00:00:00Z', updated_at: '2026-08-20T00:00:00Z', status: 'active', end_date: '2026-12-31T00:00:00Z' }],
      [
        { user_id: 'renewed', event_type: 'created', previous_status: null, status: 'active', end_date: '2026-08-31T00:00:00Z', created_at: '2026-07-01T00:00:00Z' },
        { user_id: 'renewed', event_type: 'renewed', previous_status: 'active', status: 'active', end_date: '2026-12-31T00:00:00Z', created_at: '2026-08-20T00:00:00Z' },
      ],
      start,
      end,
    );

    expect(result).toEqual({ activeAtStart: 1, cancellations: 0, isComplete: true, rate: 0 });
  });

  it('returns zero churn when a complete period has no active subscribers at its start', () => {
    const result = calculatePlatformChurn(
      [{ user_id: 'ended', created_at: '2026-07-01T00:00:00Z', updated_at: '2026-08-20T00:00:00Z', status: 'cancelled', end_date: null }],
      [{ user_id: 'ended', event_type: 'status_changed', previous_status: 'active', status: 'cancelled', end_date: null, created_at: '2026-08-20T00:00:00Z' }],
      start,
      end,
    );

    expect(result).toEqual({ activeAtStart: 0, cancellations: 0, isComplete: true, rate: 0 });
  });

  it('does not treat a known cancellation before period start as missing history', () => {
    const result = calculatePlatformChurn(
      [{ user_id: 'orphaned-test-row', created_at: '2026-07-01T00:00:00Z', updated_at: '2026-08-20T00:00:00Z', status: 'cancelled', end_date: '2026-12-31T00:00:00Z' }],
      [],
      start,
      end,
    );

    expect(result).toEqual({ activeAtStart: 0, cancellations: 0, isComplete: true, rate: 0 });
  });
});
