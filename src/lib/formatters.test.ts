import { describe, expect, it } from 'vitest';
import { addBusinessCalendarDays, businessDateKey, businessDateTimeToISOString, differenceInBusinessDays, formatBusinessDateInput, formatCompactCurrency, formatCurrency, formatDateOnlyBR, getBusinessMonthDateRange, isBusinessDateBeforeToday } from './formatters';

describe('formatCurrency', () => {
  it('uses Brazilian currency separators and cents', () => {
    expect(formatCurrency(1234.56).replace(/\u00a0/g, ' ')).toBe('R$ 1.234,56');
  });

  it('formats numeric strings and safely handles invalid values', () => {
    expect(formatCurrency('50.5')).toContain('50,50');
    expect(formatCurrency('not a number')).toContain('0,00');
  });

  it('keeps compact chart labels localized', () => {
    const result = formatCompactCurrency(18400);
    expect(result).toContain('R$');
    expect(result).toContain('18,4');
  });
});

describe('business date helpers', () => {
  it('keeps the Brazilian calendar date when UTC has crossed midnight', () => {
    expect(formatBusinessDateInput(new Date('2026-11-15T02:30:00.000Z'))).toBe('2026-11-14');
  });

  it('uses the Brazilian month when the browser clock is already in the next UTC month', () => {
    expect(getBusinessMonthDateRange(new Date('2026-12-01T02:00:00.000Z'))).toEqual({ start: '2026-11-01', end: '2026-11-30' });
  });

  it('stores a selected date through the end of that day in Sao Paulo', () => {
    expect(businessDateTimeToISOString('2026-11-14', '23:59:59')).toBe('2026-11-15T02:59:59.000Z');
  });

  it('groups timestamps by the Sao Paulo calendar date around UTC midnight', () => {
    expect(businessDateKey('2026-11-15T02:59:59.000Z')).toBe('2026-11-14');
    expect(businessDateKey('2026-11-15T03:00:00.000Z')).toBe('2026-11-15');
  });

  it('treats a date as valid for the whole selected day', () => {
    expect(isBusinessDateBeforeToday('2026-11-14', new Date('2026-11-15T02:30:00.000Z'))).toBe(false);
    expect(isBusinessDateBeforeToday('2026-11-13', new Date('2026-11-15T02:30:00.000Z'))).toBe(true);
  });

  it('formats date-only strings without shifting them to the previous day', () => {
    expect(formatDateOnlyBR('2026-11-14', { day: '2-digit', month: '2-digit', year: '2-digit' })).toBe('14/11/26');
  });

  it('calculates date ranges and countdowns in the business timezone', () => {
    expect(addBusinessCalendarDays('2026-11-14', 7)).toBe('2026-11-21');
    expect(differenceInBusinessDays('2026-11-15T03:00:00.000Z', new Date('2026-11-14T23:00:00.000Z'))).toBe(1);
  });
});
