import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

const PLAN_PRICE_MAP: Record<string, string> = {
  basic: "price_1Sxv8YLLAa7XPFh3cwA1YeWW",
  pro: "price_1Sxv9ULLAa7XPFh3iVH7F5OQ",
  enterprise: "price_1Sxv9iLLAa7XPFh3q4j2PU7x",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    const { plan_type } = await req.json();
    logStep("Requested plan", { plan_type });

    const priceId = PLAN_PRICE_MAP[plan_type];
    if (!priceId) throw new Error(`Invalid plan type: ${plan_type}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

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
      success_url: `${returnOrigin}/onboarding?payment=success&plan=${plan_type}`,
      cancel_url: `${returnOrigin}/cadastro?payment=cancelled`,
      metadata: {
        user_id: user.id,
        plan_type,
      },
      subscription_data: {
        // These values are copied to the Stripe subscription and allow future
        // lifecycle events (renewal/cancellation) to be linked to VIZZU.
        metadata: {
          user_id: user.id,
          plan_type,
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
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
