import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // No CORS needed for webhooks

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // If STRIPE_WEBHOOK_SECRET is set, verify signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Signature verified");
    } else {
      event = JSON.parse(body) as Stripe.Event;
      logStep("No webhook secret, parsing body directly");
    }

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

        // Update subscription to active and payment_status to paid
        const { error } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "active",
            payment_status: "paid",
          })
          .eq("user_id", userId)
          .eq("plan_type", planType)
          .eq("payment_status", "pending");

        if (error) {
          logStep("Error updating subscription", { error: error.message });
        } else {
          logStep("Subscription activated successfully");
        }

        // Record payment in platform_payments
        const { error: paymentError } = await supabase
          .from("platform_payments")
          .insert({
            user_id: userId,
            amount: (session.amount_total || 0) / 100,
            status: "paid",
            payment_method: "stripe",
            paid_at: new Date().toISOString(),
            subscription_id: null, // Will be linked if needed
          });

        if (paymentError) {
          logStep("Error recording payment", { error: paymentError.message });
        } else {
          logStep("Payment recorded");
        }
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
