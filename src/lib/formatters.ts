const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const COMPACT_BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

export function formatBusinessDateInput(value = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getBusinessMonthDateRange(value = new Date()): { start: string; end: string } {
  const [year, month] = formatBusinessDateInput(value).split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthPart = String(month).padStart(2, '0');
  return {
    start: `${year}-${monthPart}-01`,
    end: `${year}-${monthPart}-${String(lastDay).padStart(2, '0')}`,
  };
}

function getTimeZoneOffset(dateOnly: string, timeZone = BUSINESS_TIME_ZONE): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const reference = new Date(Date.UTC(year, month - 1, day, 12));
  const label = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(reference)
    .find((part) => part.type === 'timeZoneName')?.value || 'GMT';
  const match = label.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return '+00:00';
  return `${match[1]}${match[2].padStart(2, '0')}:${match[3] || '00'}`;
}

export function businessDateTimeToISOString(dateOnly: string, time = '00:00:00'): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly) || !/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    throw new RangeError('Informe uma data e hora válidas.');
  }
  return new Date(`${dateOnly}T${time}${getTimeZoneOffset(dateOnly)}`).toISOString();
}

export function isBusinessDateBeforeToday(dateOnly: string | null | undefined, now = new Date()): boolean {
  return Boolean(dateOnly && dateOnly.slice(0, 10) < formatBusinessDateInput(now));
}

export function formatDateOnlyBR(
  dateOnly: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string {
  const match = dateOnly.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateOnly;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(date);
}

export function formatDateInBusinessTimeZone(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string {
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: BUSINESS_TIME_ZONE }).format(new Date(value));
}

export function businessDateKey(value: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function addBusinessCalendarDays(dateOnly: string, days: number): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12)).toISOString().slice(0, 10);
}

export function differenceInBusinessDays(dateTime: string, now = new Date()): number {
  const today = formatBusinessDateInput(now);
  const target = businessDateKey(dateTime);
  const toUtcDay = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtcDay(target) - toUtcDay(today)) / 86_400_000);
}

export function formatCurrency(value: number | string | null | undefined): string {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  return BRL_FORMATTER.format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatCompactCurrency(value: number | string | null | undefined): string {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  return COMPACT_BRL_FORMATTER.format(Number.isFinite(numericValue) ? numericValue : 0);
}
