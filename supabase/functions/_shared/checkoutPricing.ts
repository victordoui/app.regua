export type CheckoutBillingCycle = "monthly" | "yearly";

export interface StripeRecurringPriceCandidate {
  active: boolean;
  currency: string;
  type: string;
  unit_amount: number | null;
  recurring?: { interval: string } | null;
}

export function isStripePriceCompatible(
  price: StripeRecurringPriceCandidate,
  expectedAmountCents: number,
  expectedInterval: "month" | "year",
): boolean {
  return price.active
    && price.currency.toLowerCase() === "brl"
    && price.type === "recurring"
    && price.recurring?.interval === expectedInterval
    && price.unit_amount === expectedAmountCents;
}

export function stripePriceIdempotencyKey(
  planType: string,
  billingCycle: CheckoutBillingCycle,
  amountCents: number,
  productId: string,
): string {
  return `vizzu-${planType}-${billingCycle}-${amountCents}-${productId}-v1`;
}
