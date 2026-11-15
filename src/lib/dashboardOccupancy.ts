export function estimateBusinessOccupancyPercent(occupiedMinutes: number, availableMinutes: number): number | null {
  if (!Number.isFinite(occupiedMinutes) || !Number.isFinite(availableMinutes) || availableMinutes <= 0 || occupiedMinutes < 0) {
    return null;
  }

  return Math.round(Math.min(100, (occupiedMinutes / availableMinutes) * 100) * 10) / 10;
}
