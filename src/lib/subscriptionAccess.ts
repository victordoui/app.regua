export type SubscriptionAccessStatus =
  | 'active'
  | 'paused'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'pending_payment'
  | string;

export interface SubscriptionAccessInput {
  status: SubscriptionAccessStatus;
  end_date: string | null;
}

export type SubscriptionAccessDecision =
  | { allowed: true; reason: 'active' }
  | { allowed: false; reason: 'missing' | 'suspended' | 'cancelled' | 'expired' | 'pending_payment' };

export function getSubscriptionAccessDecision(
  subscription: SubscriptionAccessInput | null | undefined,
  now = new Date(),
): SubscriptionAccessDecision {
  if (!subscription) return { allowed: false, reason: 'missing' };

  if (subscription.status === 'suspended' || subscription.status === 'paused') {
    return { allowed: false, reason: 'suspended' };
  }
  if (subscription.status === 'cancelled') return { allowed: false, reason: 'cancelled' };
  if (subscription.status === 'expired') return { allowed: false, reason: 'expired' };
  if (subscription.status === 'pending_payment') return { allowed: false, reason: 'pending_payment' };

  if (subscription.end_date && new Date(subscription.end_date).getTime() <= now.getTime()) {
    return { allowed: false, reason: 'expired' };
  }

  return { allowed: true, reason: 'active' };
}
