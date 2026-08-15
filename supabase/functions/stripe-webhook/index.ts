import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // No CORS needed for webhooks

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing Stripe signature" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid Stripe signature" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }
    logStep("Signature verified");

    logStep("Event type", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const planType = session.metadata?.plan_type;

      logStep("Checkout completed", { userId, planType, paymentStatus: session.payment_status });

      if (userId && session.payment_status === "paid") {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: plan, error: planError } = await supabase
          .from("platform_plan_config")
          .select("plan_type, max_barbers, max_appointments_month, features")
          .eq("plan_type", planType)
          .eq("is_active", true)
          .maybeSingle();
        if (planError || !plan) {
          throw new Error(`Plan lookup failed: ${planError?.message || "plan not available"}`);
        }

        // A paid checkout can follow an expired trial or change an active
        // paid plan. There is one subscription row per business, so update
        // that row rather than requiring a matching pending plan type.
        const paymentStart = new Date(event.created * 1000);
        const paymentEnd = new Date(paymentStart);
        paymentEnd.setMonth(paymentEnd.getMonth() + 1);

        // Repeating a verified Stripe event is safe: subscription activation is
        // idempotent and the payment row has a unique provider event id.
        const { data: activatedSubscription, error } = await supabase
          .from("platform_subscriptions")
          .update({
            plan_type: plan.plan_type,
            status: "active",
            payment_status: "paid",
            start_date: paymentStart.toISOString(),
            end_date: paymentEnd.toISOString(),
            max_barbers: plan.max_barbers,
            max_appointments_month: plan.max_appointments_month,
            features: plan.features,
          })
          .eq("user_id", userId)
          .select("id")
          .maybeSingle();

        if (error) {
          throw new Error(`Subscription activation failed: ${error.message}`);
        }
        logStep("Subscription activation processed");

        let subscriptionId = activatedSubscription?.id ?? null;
        if (!subscriptionId) {
          const { data: existingSubscription, error: existingError } = await supabase
            .from("platform_subscriptions")
            .select("id")
            .eq("user_id", userId)
            .eq("status", "active")
            .maybeSingle();
          if (existingError) throw new Error(`Subscription lookup failed: ${existingError.message}`);
          subscriptionId = existingSubscription?.id ?? null;
        }

        // Record payment in platform_payments
        const { error: paymentError } = await supabase
          .from("platform_payments")
          .insert({
            user_id: userId,
            amount: (session.amount_total || 0) / 100,
            status: "paid",
            payment_method: "stripe",
            paid_at: new Date(event.created * 1000).toISOString(),
            subscription_id: subscriptionId,
            provider_event_id: event.id,
          });

        if (paymentError) {
          if (paymentError.code === "23505") {
            logStep("Duplicate Stripe event ignored", { eventId: event.id });
          } else {
            throw new Error(`Payment recording failed: ${paymentError.message}`);
          }
        } else {
          logStep("Payment recorded");
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      const userId = stripeSubscription.metadata?.user_id;
      if (userId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        const periodEndSeconds = (stripeSubscription as unknown as { current_period_end?: number }).current_period_end;
        const endDate = periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : undefined;
        const stripeStatus = stripeSubscription.status;
        const status = event.type === "customer.subscription.deleted" || stripeStatus === "canceled"
          ? "cancelled"
          : stripeStatus === "active" || stripeStatus === "trialing"
            ? "active"
            : "pending_payment";
        const paymentStatus = status === "active" ? "paid" : status === "cancelled" ? "cancelled" : "pending";

        const payload: Record<string, unknown> = { status, payment_status: paymentStatus };
        if (endDate) payload.end_date = endDate;

        const { error } = await supabase
          .from("platform_subscriptions")
          .update(payload)
          .eq("user_id", userId);
        if (error) throw new Error(`Subscription lifecycle update failed: ${error.message}`);
        logStep("Subscription lifecycle synchronized", { userId, stripeStatus, status });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
