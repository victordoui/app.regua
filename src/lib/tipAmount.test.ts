import { describe, expect, it } from 'vitest';
import { parseTipAmount } from './tipAmount';

describe('parseTipAmount', () => {
  it('treats an empty value as no tip', () => {
    expect(parseTipAmount('')).toBe(0);
  });

  it('accepts Brazilian decimal values and thousands separators', () => {
    expect(parseTipAmount('12,50')).toBe(12.5);
    expect(parseTipAmount('1.234,56')).toBe(1234.56);
  });

  it('accepts a dot decimal and whole numbers', () => {
    expect(parseTipAmount('12.5')).toBe(12.5);
    expect(parseTipAmount('20')).toBe(20);
  });

  it('rejects negative, malformed, and over-precision values', () => {
    expect(parseTipAmount('-5')).toBeNull();
    expect(parseTipAmount('1,234')).toBeNull();
    expect(parseTipAmount('abc')).toBeNull();
  });
});
