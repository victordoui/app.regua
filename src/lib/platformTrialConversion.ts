export type TrialConversionEvent = {
  user_id: string;
  event_type: string;
  previous_plan_type: string | null;
  plan_type: string | null;
  created_at: string;
};

export function calculatePlatformTrialConversion(
  events: TrialConversionEvent[],
  periodStart: Date,
  periodEnd: Date,
) {
  const startsByUser = new Map<string, number>();
  for (const event of events) {
    if (!['created', 'snapshot'].includes(event.event_type) || event.plan_type !== 'trial') continue;
    const timestamp = Date.parse(event.created_at);
    if (!Number.isFinite(timestamp)) continue;
    startsByUser.set(event.user_id, Math.min(startsByUser.get(event.user_id) ?? Infinity, timestamp));
  }

  const start = periodStart.getTime();
  const end = periodEnd.getTime();
  const cohort = [...startsByUser.entries()].filter(([, createdAt]) => createdAt >= start && createdAt < end);
  const convertedUsers = new Set(
    events
      .filter((event) => event.event_type === 'plan_changed' && event.previous_plan_type === 'trial' && event.plan_type !== 'trial')
      .filter((event) => {
        const timestamp = Date.parse(event.created_at);
        return Number.isFinite(timestamp) && timestamp >= start && timestamp < end && (startsByUser.get(event.user_id) ?? Infinity) <= timestamp;
      })
      .map((event) => event.user_id),
  );
  const converted = cohort.filter(([userId]) => convertedUsers.has(userId)).length;

  return {
    trialStarts: cohort.length,
    converted,
    percent: cohort.length ? (converted / cohort.length) * 100 : 0,
  };
}
