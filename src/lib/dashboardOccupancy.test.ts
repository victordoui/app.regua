import { describe, expect, it } from 'vitest';
import { estimateBusinessOccupancyPercent } from './dashboardOccupancy';

describe('estimateBusinessOccupancyPercent', () => {
  it('keeps low but nonzero occupancy visible to one decimal place', () => {
    expect(estimateBusinessOccupancyPercent(380, 259_200)).toBe(0.1);
  });

  it('returns zero when no minutes are occupied', () => {
    expect(estimateBusinessOccupancyPercent(0, 1_000)).toBe(0);
  });

  it('caps occupancy at 100 percent', () => {
    expect(estimateBusinessOccupancyPercent(1_200, 1_000)).toBe(100);
  });

  it('returns null when available minutes are missing or invalid', () => {
    expect(estimateBusinessOccupancyPercent(10, 0)).toBeNull();
    expect(estimateBusinessOccupancyPercent(10, Number.NaN)).toBeNull();
    expect(estimateBusinessOccupancyPercent(-1, 100)).toBeNull();
  });
});
