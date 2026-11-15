import { describe, expect, it } from 'vitest';
import { calculatePlatformTrialConversion, type TrialConversionEvent } from './platformTrialConversion';

const event = (user_id: string, event_type: string, plan_type: string | null, created_at: string, previous_plan_type: string | null = null): TrialConversionEvent => ({
  user_id,
  event_type,
  previous_plan_type,
  plan_type,
  created_at,
});

const start = new Date('2026-11-01T00:00:00.000Z');
const end = new Date('2026-12-01T00:00:00.000Z');

describe('calculatePlatformTrialConversion', () => {
  it('calculates the conversion rate for trial users who started in the period', () => {
    const events = [
      event('qa-a', 'created', 'trial', '2026-11-02T12:00:00.000Z'),
      event('qa-a', 'plan_changed', 'pro', '2026-11-05T12:00:00.000Z', 'trial'),
      event('qa-b', 'created', 'trial', '2026-11-10T12:00:00.000Z'),
      event('qa-c', 'created', 'trial', '2026-10-10T12:00:00.000Z'),
      event('qa-c', 'plan_changed', 'pro', '2026-11-12T12:00:00.000Z', 'trial'),
    ];

    expect(calculatePlatformTrialConversion(events, start, end)).toEqual({ trialStarts: 2, converted: 1, percent: 50 });
  });

  it('uses the earliest trial start when events arrive in a different order', () => {
    const events = [
      event('qa-a', 'snapshot', 'trial', '2026-11-04T12:00:00.000Z'),
      event('qa-a', 'created', 'trial', '2026-10-20T12:00:00.000Z'),
      event('qa-a', 'plan_changed', 'basic', '2026-11-06T12:00:00.000Z', 'trial'),
    ];

    expect(calculatePlatformTrialConversion(events, start, end)).toEqual({ trialStarts: 0, converted: 0, percent: 0 });
  });

  it('handles empty cohorts and excludes invalid timestamps', () => {
    const events = [event('qa-a', 'created', 'trial', 'not-a-date')];
    expect(calculatePlatformTrialConversion(events, start, end)).toEqual({ trialStarts: 0, converted: 0, percent: 0 });
  });
});
