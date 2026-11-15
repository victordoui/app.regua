import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { isStripePriceCompatible, stripePriceIdempotencyKey } from "../_shared/checkoutPricing.ts";

const configuredOrigins = [
  Deno.env.get("SITE_URL"),
  Deno.env.get("APP_URL"),
  ...(Deno.env.get("ALLOWED_ORIGINS") || "").split(","),
  // Mantém a origem já usada pela versão publicada até que o domínio oficial
  // seja definido nas variáveis de ambiente da função.
  "https://appnaregua.lovable.app",
].map((origin) => origin?.trim()).filter((origin): origin is string => Boolean(origin));

const getAllowedOrigin = (origin: string | null) => {
  if (!origin) return configuredOrigins[0] || "https://appnaregua.lovable.app";

  const isLocalDevelopmentOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return configuredOrigins.includes(origin) || isLocalDevelopmentOrigin ? origin : null;
};

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(origin) || configuredOrigins[0] || "https://appnaregua.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Vary": "Origin",
});

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

type CheckoutPlan = {
  plan_type: string;
  display_name: string | null;
  stripe_price_id: string | null;
  stripe_price_yearly_id?: string | null;
  stripe_price_legacy_id?: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  is_active: boolean;
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(origin);

  if (req.method === "OPTIONS") {
    if (!allowedOrigin) return new Response("Forbidden", { status: 403 });
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (origin && !allowedOrigin) {
    return new Response(JSON.stringify({ error: "ORIGIN_NOT_ALLOWED" }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      status: 403,
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { plan_type, billing_cycle = "monthly" } = await req.json();
    logStep("Requested plan", { plan_type, billing_cycle });

    if (!['basic', 'pro', 'enterprise'].includes(plan_type) || !['monthly', 'yearly'].includes(billing_cycle)) {
      return new Response(JSON.stringify({ error: "INVALID_PLAN" }), {
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" }, status: 400,
      });
    }

    let planSupportsDynamicPrices = true;
    let plan: CheckoutPlan | null = null;
    let planError: unknown = null;
    const currentPlan = await supabaseClient
      .from("platform_plan_config")
      .select("plan_type, display_name, stripe_price_id, stripe_price_yearly_id, stripe_price_legacy_id, price_monthly, price_yearly, is_active")
      .eq("plan_type", plan_type)
      .eq("is_active", true)
      .maybeSingle();
    plan = currentPlan.data as CheckoutPlan | null;
    planError = currentPlan.error;
    if (planError) {
      planSupportsDynamicPrices = false;
      const legacyPlan = await supabaseClient
        .from("platform_plan_config")
        .select("plan_type, display_name, stripe_price_id, price_monthly, price_yearly, is_active")
        .eq("plan_type", plan_type)
        .eq("is_active", true)
        .maybeSingle();
      plan = legacyPlan.data as CheckoutPlan | null;
      planError = legacyPlan.error;
    }
    const priceField = billing_cycle === "yearly" ? "stripe_price_yearly_id" : "stripe_price_id";
    let priceId = billing_cycle === "yearly" ? plan?.stripe_price_yearly_id : plan?.stripe_price_id;
    const expectedPrice = billing_cycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly;
    if (planError || !plan || expectedPrice == null || !Number.isFinite(Number(expectedPrice)) || Number(expectedPrice) <= 0) {
      return new Response(JSON.stringify({ error: "PLAN_NOT_AVAILABLE" }), {
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" }, status: 409,
      });
    }
    if (!planSupportsDynamicPrices && billing_cycle === "yearly") {
      return new Response(JSON.stringify({ error: "PLAN_NOT_AVAILABLE" }), {
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" }, status: 409,
      });
    }
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "CHECKOUT_NOT_CONFIGURED" }), {
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" }, status: 503,
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const expectedInterval = billing_cycle === "yearly" ? "year" : "month";
    const expectedAmountCents = Math.round(Number(expectedPrice) * 100);
    let compatiblePrice = null;

    if (priceId) {
      try {
        const existingPrice = await stripe.prices.retrieve(priceId);
        if (isStripePriceCompatible(existingPrice, expectedAmountCents, expectedInterval)) {
          compatiblePrice = existingPrice;
        }
      } catch {
        // Rebuild an unavailable or outdated Price from the plan's saved product.
      }
    }

    if (!compatiblePrice) {
      const referencePriceId = plan.stripe_price_legacy_id || priceId;
      let productId: string | null = null;

      if (referencePriceId) {
        const referencePrice = await stripe.prices.retrieve(referencePriceId);
        productId = typeof referencePrice.product === "string"
          ? referencePrice.product
          : referencePrice.product.id;

        const product = await stripe.products.retrieve(productId);
        if (!("active" in product) || !product.active) {
          return new Response(JSON.stringify({ error: "PLAN_NOT_AVAILABLE" }), {
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }, status: 409,
          });
        }
      } else {
        const product = await stripe.products.create({
          name: `VIZZU ${plan.display_name || plan_type}`,
          metadata: { plan_type, managed_by: "VIZZU" },
        }, { idempotencyKey: `vizzu-${plan_type}-product-v1` });
        productId = product.id;
      }

      if (!productId) throw new Error("Stripe product is unavailable for this plan");

      const generatedPrice = await stripe.prices.create({
        product: productId,
        currency: "brl",
        unit_amount: expectedAmountCents,
        recurring: { interval: expectedInterval },
        metadata: { plan_type, billing_cycle, managed_by: "VIZZU" },
      }, {
        idempotencyKey: stripePriceIdempotencyKey(plan_type, billing_cycle, expectedAmountCents, productId),
      });

      if (!isStripePriceCompatible(generatedPrice, expectedAmountCents, expectedInterval)) {
        throw new Error("Stripe did not return a recurring Price matching the approved plan");
      }

      priceId = generatedPrice.id;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!serviceRoleKey) throw new Error("Checkout price persistence is not configured");
      const platformClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        serviceRoleKey,
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      const { error: persistPriceError } = await platformClient
        .from("platform_plan_config")
        .update({ [priceField]: priceId })
        .eq("plan_type", plan_type);
      if (persistPriceError) throw persistPriceError;

      logStep("Plan price synchronized", { plan_type, billing_cycle });
    } else {
      priceId = compatiblePrice.id;
    }

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const returnOrigin = allowedOrigin || configuredOrigins[0] || "https://appnaregua.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${returnOrigin}/onboarding?payment=success&plan=${plan_type}&ciclo=${billing_cycle}`,
      cancel_url: `${returnOrigin}/cadastro?payment=cancelled`,
      metadata: {
        user_id: user.id,
        plan_type,
        billing_cycle,
      },
      subscription_data: {
        // These values are copied to the Stripe subscription and allow future
        // lifecycle events (renewal/cancellation) to be linked to VIZZU.
        metadata: {
          user_id: user.id,
          plan_type,
          billing_cycle,
        },
      },
    });

    // The checkout URL contains a session token; never persist it in logs.
    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: "CHECKOUT_UNAVAILABLE" }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
