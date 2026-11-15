import { describe, expect, it } from "vitest";
import {
  isStripePriceCompatible,
  stripePriceIdempotencyKey,
} from "../../supabase/functions/_shared/checkoutPricing";

const expectedPrice = {
  active: true,
  currency: "brl",
  type: "recurring",
  unit_amount: 8990,
  recurring: { interval: "month" },
};

describe("checkout pricing", () => {
  it("reuses only an active recurring BRL price with the exact amount and interval", () => {
    expect(isStripePriceCompatible(expectedPrice, 8990, "month")).toBe(true);
    expect(isStripePriceCompatible({ ...expectedPrice, active: false }, 8990, "month")).toBe(false);
    expect(isStripePriceCompatible({ ...expectedPrice, currency: "usd" }, 8990, "month")).toBe(false);
    expect(isStripePriceCompatible({ ...expectedPrice, unit_amount: 14990 }, 8990, "month")).toBe(false);
    expect(isStripePriceCompatible({ ...expectedPrice, recurring: { interval: "year" } }, 8990, "month")).toBe(false);
  });

  it("creates stable idempotency keys and separates plans, cycles, amounts, and products", () => {
    const key = stripePriceIdempotencyKey("pro", "yearly", 89900, "prod_vizzu");
    expect(key).toBe("vizzu-pro-yearly-89900-prod_vizzu-v1");
    expect(stripePriceIdempotencyKey("pro", "yearly", 89900, "prod_vizzu")).toBe(key);
    expect(stripePriceIdempotencyKey("pro", "monthly", 8990, "prod_vizzu")).not.toBe(key);
    expect(stripePriceIdempotencyKey("basic", "yearly", 44900, "prod_vizzu")).not.toBe(key);
    expect(stripePriceIdempotencyKey("pro", "yearly", 89900, "prod_other")).not.toBe(key);
  });
});
