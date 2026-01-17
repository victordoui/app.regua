import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Campaign {
  id: string;
  user_id: string;
  name: string;
  type: string;
  target_audience: string;
  channels: string[];
  template_id: string | null;
  custom_message: string | null;
  status: string;
}

interface Template {
  id: string;
  subject: string | null;
  message: string;
  type: string;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID');
    const zapiToken = Deno.env.get('ZAPI_TOKEN');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { campaign_id } = await req.json();

    if (!campaign_id) {
      throw new Error('campaign_id is required');
    }

    console.log(`[Campaign] Starting campaign: ${campaign_id}`);

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('notification_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignError?.message}`);
    }

    // Update campaign status to 'sending'
    await supabase
      .from('notification_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign_id);

    // Fetch template if exists
    let template: Template | null = null;
    if (campaign.template_id) {
      const { data: tmpl } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', campaign.template_id)
        .single();
      template = tmpl;
    }

    // Get message content
    const messageContent = campaign.custom_message || template?.message || '';
    const subject = template?.subject || campaign.name;

    if (!messageContent) {
      throw new Error('No message content available');
    }

    // Fetch recipients based on target audience
    let clientsQuery = supabase
      .from('clients')
      .select('id, name, email, phone, created_at')
      .eq('user_id', campaign.user_id);

    const now = new Date();

    // Filter by audience type
    if (campaign.target_audience === 'inactive') {
      // Clients who haven't had an appointment in 30+ days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const { data: activeClientIds } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('user_id', campaign.user_id)
        .gte('appointment_date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      const activeIds = [...new Set(activeClientIds?.map(a => a.client_id) || [])];
      if (activeIds.length > 0) {
        clientsQuery = clientsQuery.not('id', 'in', `(${activeIds.join(',')})`);
      }
    } else if (campaign.target_audience === 'vip') {
      // Clients with 5+ appointments
      const { data: vipClients } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('user_id', campaign.user_id);
      
      const clientCounts: Record<string, number> = {};
      vipClients?.forEach(a => {
        clientCounts[a.client_id] = (clientCounts[a.client_id] || 0) + 1;
      });
      
      const vipIds = Object.entries(clientCounts)
        .filter(([_, count]) => count >= 5)
        .map(([id]) => id);
      
      if (vipIds.length > 0) {
        clientsQuery = clientsQuery.in('id', vipIds);
      } else {
        // No VIP clients
        clientsQuery = clientsQuery.eq('id', 'no-match');
      }
    } else if (campaign.target_audience === 'birthday') {
      // Today's birthdays (would need birth_date field)
      const todayMonth = now.getMonth() + 1;
      const todayDay = now.getDate();
      // This requires birth_date column which may or may not exist
      // For now, we'll just get all clients
    }

    const { data: clients, error: clientsError } = await clientsQuery;

    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    console.log(`[Campaign] Found ${clients?.length || 0} recipients`);

    let sentCount = 0;
    let failedCount = 0;
    const channels = campaign.channels as string[];

    // Process each client
    for (const client of clients || []) {
      // Replace variables in message
      const personalizedMessage = messageContent
        .replace(/{nome}/g, client.name)
        .replace(/{name}/g, client.name);

      for (const channel of channels) {
        try {
          let recipient = '';
          let status = 'sent';
          let errorMessage: string | null = null;

          if (channel === 'email' && client.email) {
            recipient = client.email;
            
            if (resendApiKey) {
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Barbearia <onboarding@resend.dev>',
                  to: [client.email],
                  subject: subject,
                  html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #333;">${subject}</h2>
                    <p style="font-size: 16px; color: #555;">${personalizedMessage}</p>
                  </div>`,
                }),
              });

              if (!emailResponse.ok) {
                status = 'failed';
                errorMessage = await emailResponse.text();
              }
            } else {
              status = 'failed';
              errorMessage = 'RESEND_API_KEY not configured';
            }
          } else if (channel === 'whatsapp' && client.phone) {
            recipient = client.phone;
            
            if (zapiInstanceId && zapiToken) {
              const zapiResponse = await fetch(
                `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phone: client.phone.replace(/\D/g, ''),
                    message: personalizedMessage,
                  }),
                }
              );

              if (!zapiResponse.ok) {
                status = 'failed';
                errorMessage = await zapiResponse.text();
              }
            } else {
              status = 'failed';
              errorMessage = 'Z-API not configured';
            }
          } else if (channel === 'push') {
            // Push notifications handled separately
            continue;
          } else {
            continue; // Skip if no valid recipient
          }

          // Log the notification
          await supabase.from('notification_logs').insert({
            user_id: campaign.user_id,
            client_id: client.id,
            campaign_id: campaign.id,
            template_id: campaign.template_id,
            channel,
            recipient,
            subject: channel === 'email' ? subject : null,
            message: personalizedMessage,
            status,
            error_message: errorMessage,
            delivered_at: status === 'sent' ? new Date().toISOString() : null,
          });

          if (status === 'sent') {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          console.error(`Error sending to ${client.id} via ${channel}:`, err);
          failedCount++;

          await supabase.from('notification_logs').insert({
            user_id: campaign.user_id,
            client_id: client.id,
            campaign_id: campaign.id,
            channel,
            recipient: channel === 'email' ? client.email : client.phone || 'unknown',
            message: personalizedMessage,
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    // Update campaign with final stats
    await supabase
      .from('notification_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: clients?.length || 0,
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq('id', campaign_id);

    console.log(`[Campaign] Completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        recipients_count: clients?.length || 0,
        sent_count: sentCount,
        failed_count: failedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Campaign] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
