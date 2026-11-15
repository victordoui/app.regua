export interface ChurnSubscription {
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
  status: string;
  end_date: string | null;
}

export interface ChurnHistoryEvent {
  user_id: string;
  event_type: string;
  previous_status: string | null;
  status: string;
  end_date: string | null;
  created_at: string;
}

export interface PlatformChurnResult {
  activeAtStart: number;
  cancellations: number;
  isComplete: boolean;
  rate: number | null;
}

export function calculatePlatformChurn(
  subscriptions: ChurnSubscription[],
  events: ChurnHistoryEvent[],
  periodStart: Date,
  periodEnd: Date,
): PlatformChurnResult {
  const startTime = periodStart.getTime();
  const endTime = periodEnd.getTime();
  const eventsByUser = new Map<string, ChurnHistoryEvent[]>();

  for (const event of events) {
    const userEvents = eventsByUser.get(event.user_id) || [];
    userEvents.push(event);
    eventsByUser.set(event.user_id, userEvents);
  }

  const activeAtStart = new Set<string>();
  let isComplete = true;
  for (const subscription of subscriptions) {
    const createdAt = subscription.created_at ? Date.parse(subscription.created_at) : Number.NaN;
    if (!Number.isFinite(createdAt)) {
      isComplete = false;
      continue;
    }
    if (createdAt > startTime) continue;

    const stateBeforeStart = (eventsByUser.get(subscription.user_id) || [])
      .filter((event) => Date.parse(event.created_at) <= startTime)
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
      .at(-1);

    if (!stateBeforeStart) {
      const updatedAt = subscription.updated_at ? Date.parse(subscription.updated_at) : Number.NaN;
      const endDate = subscription.end_date ? Date.parse(subscription.end_date) : Number.NaN;
      const knownInactiveAtStart = Number.isFinite(updatedAt)
        && updatedAt <= startTime
        && (subscription.status !== 'active' || (Number.isFinite(endDate) && endDate <= startTime));
      if (knownInactiveAtStart) continue;
      isComplete = false;
      continue;
    }

    const endDate = stateBeforeStart.end_date ? Date.parse(stateBeforeStart.end_date) : Number.NaN;
    const notExpiredAtStart = !Number.isFinite(endDate) || endDate > startTime;
    if (stateBeforeStart.status === 'active' && notExpiredAtStart) activeAtStart.add(subscription.user_id);
  }

  const cancellationUsers = new Set(events
    .filter((event) => event.event_type === 'status_changed'
      && event.previous_status === 'active'
      && event.status === 'cancelled'
      && Date.parse(event.created_at) >= startTime
      && Date.parse(event.created_at) < endTime
      && activeAtStart.has(event.user_id))
    .map((event) => event.user_id));

  return {
    activeAtStart: activeAtStart.size,
    cancellations: cancellationUsers.size,
    isComplete,
    rate: isComplete
      ? activeAtStart.size ? (cancellationUsers.size / activeAtStart.size) * 100 : 0
      : null,
  };
}
