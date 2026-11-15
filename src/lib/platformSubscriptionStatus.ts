import type { SubscriptionAccessInput } from '@/lib/subscriptionAccess';

/**
 * Returns the status shown to platform operators. An active record whose end
 * timestamp has passed is expired even when the persisted status was not
 * updated by a scheduled job.
 */
export function getEffectiveSubscriptionStatus(
  subscription: SubscriptionAccessInput | null | undefined,
  now = new Date(),
): string | null {
  if (!subscription) return null;
  if (
    subscription.status === 'active' &&
    subscription.end_date &&
    new Date(subscription.end_date).getTime() <= now.getTime()
  ) {
    return 'expired';
  }
  return subscription.status;
}
