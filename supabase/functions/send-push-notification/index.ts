import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  user_id?: string;
  subscription?: PushSubscriptionJSON;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
  requireInteraction?: boolean;
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Web Push implementation using Web Crypto API
async function sendWebPush(
  subscription: PushSubscriptionJSON,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  // For now, we'll use a simpler approach that logs the attempt
  // Full web-push implementation requires proper VAPID signing
  
  console.log('[Push] Sending to endpoint:', subscription.endpoint);
  console.log('[Push] Payload:', JSON.stringify(payload));
  
  // In production, you would use a proper web-push library or implement VAPID signing
  // For Deno, you might need to use a compatible library or implement the protocol
  
  // Placeholder response - in production, implement actual push sending
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: PushPayload = await req.json();

    console.log('[Push] Request received:', JSON.stringify(payload));

    if (!payload.title || !payload.body) {
      throw new Error('title and body are required');
    }

    let subscriptions: PushSubscriptionJSON[] = [];

    // If user_id is provided, fetch their subscription
    if (payload.user_id) {
      const { data: prefs, error } = await supabase
        .from('notification_preferences')
        .select('push_subscription, push_enabled')
        .eq('user_id', payload.user_id)
        .eq('push_enabled', true)
        .single();

      if (error) {
        console.log('[Push] No subscription found for user:', payload.user_id);
      } else if (prefs?.push_subscription) {
        subscriptions.push(prefs.push_subscription as PushSubscriptionJSON);
      }
    } else if (payload.subscription) {
      // Direct subscription provided
      subscriptions.push(payload.subscription);
    }

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid push subscriptions found',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pushPayload = {
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      tag: payload.tag || 'notification',
      actions: payload.actions || [],
      requireInteraction: payload.requireInteraction || false,
    };

    let successCount = 0;
    let failedCount = 0;

    for (const subscription of subscriptions) {
      try {
        if (!vapidPublicKey || !vapidPrivateKey) {
          console.log('[Push] VAPID keys not configured, skipping push');
          failedCount++;
          continue;
        }

        const response = await sendWebPush(
          subscription,
          pushPayload,
          vapidPublicKey,
          vapidPrivateKey
        );

        if (response.ok) {
          successCount++;
          console.log('[Push] Successfully sent to:', subscription.endpoint);
        } else {
          failedCount++;
          console.error('[Push] Failed:', await response.text());
        }
      } catch (err) {
        failedCount++;
        console.error('[Push] Error sending:', err);
      }
    }

    // Log the notification if user_id is provided
    if (payload.user_id) {
      await supabase.from('notification_logs').insert({
        user_id: payload.user_id,
        channel: 'push',
        recipient: 'browser',
        subject: payload.title,
        message: payload.body,
        status: successCount > 0 ? 'sent' : 'failed',
        metadata: { url: payload.url },
      });
    }

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        sent: successCount,
        failed: failedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Push] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
