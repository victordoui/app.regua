/** Parses a Brazilian currency input without guessing ambiguous thousands separators. */
export function parseTipAmount(input: string): number | null {
  const value = input.trim();
  if (!value) return 0;

  const normalized = value.includes(',')
    ? value.replace(/\./g, '').replace(',', '.')
    : value;
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}
