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
  console.warn('[Push] Provider not implemented', {
    endpointOrigin: new URL(subscription.endpoint).origin,
    hasPayload: Boolean(payload),
    hasVapidKeys: Boolean(vapidPublicKey && vapidPrivateKey),
  });
  return new Response(JSON.stringify({ error: 'Push provider not implemented' }), { status: 501 });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('AUTH_REQUIRED');
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) throw new Error('AUTH_REQUIRED');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: PushPayload = await req.json();

    console.log('[Push] Request received:', JSON.stringify(payload));

    if (!payload.title || !payload.body) {
      throw new Error('title and body are required');
    }

    const subscriptions: PushSubscriptionJSON[] = [];
    let recipientUserId: string | null = null;

    // If user_id is provided, fetch their subscription
    if (payload.user_id) {
      if (payload.user_id === authData.user.id) {
        recipientUserId = payload.user_id;
      } else {
        const { data: recipientProfile } = await supabase
          .from('client_profiles')
          .select('user_id')
          .eq('client_id', payload.user_id)
          .eq('barbershop_user_id', authData.user.id)
          .maybeSingle();
        recipientUserId = recipientProfile?.user_id ?? null;
      }
      if (!recipientUserId) throw new Error('NOT_ALLOWED');

      const { data: prefs, error } = await supabase
        .from('notification_preferences')
        .select('push_subscription, push_enabled')
        .eq('user_id', recipientUserId)
        .eq('push_enabled', true)
        .single();

      if (error) {
        console.log('[Push] No subscription found for user:', payload.user_id);
      } else if (prefs?.push_subscription) {
        subscriptions.push(prefs.push_subscription as PushSubscriptionJSON);
      }
    } else if (payload.subscription) {
      throw new Error('DIRECT_SUBSCRIPTION_NOT_ALLOWED');
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
        user_id: authData.user.id,
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
