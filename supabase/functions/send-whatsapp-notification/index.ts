import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  phone: string;
  message: string;
  template?: 'reminder' | 'confirmation' | 'cancellation';
  appointmentData?: {
    clientName: string;
    serviceName: string;
    barberName: string;
    date: string;
    time: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Z-API credentials from secrets
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID');
    const zapiToken = Deno.env.get('ZAPI_TOKEN');
    const zapiClientToken = Deno.env.get('ZAPI_CLIENT_TOKEN');

    if (!zapiInstanceId || !zapiToken) {
      console.log('WhatsApp integration not configured - Z-API credentials missing');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp integration not configured',
          message: 'Configure ZAPI_INSTANCE_ID and ZAPI_TOKEN in secrets'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { phone, message, template, appointmentData }: WhatsAppRequest = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Format phone number (Brazil)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    // Generate message based on template
    let finalMessage = message;
    if (template && appointmentData) {
      const templates: Record<string, string> = {
        reminder: `Olá ${appointmentData.clientName}! 👋\n\nLembrete: seu agendamento na barbearia é amanhã!\n\n📅 *Data:* ${appointmentData.date}\n⏰ *Horário:* ${appointmentData.time}\n✂️ *Serviço:* ${appointmentData.serviceName}\n💈 *Barbeiro:* ${appointmentData.barberName}\n\nConfirme sua presença respondendo *SIM*.\n\nCaso precise cancelar ou reagendar, entre em contato conosco.`,
        confirmation: `✅ Agendamento Confirmado!\n\nOlá ${appointmentData.clientName}!\n\nSeu agendamento foi confirmado:\n\n📅 *Data:* ${appointmentData.date}\n⏰ *Horário:* ${appointmentData.time}\n✂️ *Serviço:* ${appointmentData.serviceName}\n💈 *Barbeiro:* ${appointmentData.barberName}\n\nTe esperamos! 💈`,
        cancellation: `Olá ${appointmentData.clientName},\n\nSeu agendamento de ${appointmentData.date} às ${appointmentData.time} foi cancelado.\n\nDeseja reagendar? Entre em contato conosco! 📞`
      };
      finalMessage = templates[template] || message;
    }

    // Send via Z-API
    const zapiUrl = `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`;
    
    const response = await fetch(zapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': zapiClientToken || ''
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: finalMessage
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Z-API error:', result);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send WhatsApp message', details: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('WhatsApp message sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-whatsapp-notification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
