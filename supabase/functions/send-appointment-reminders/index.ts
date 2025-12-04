import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Note: Resend integration requires RESEND_API_KEY secret

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPreferences {
  system_enabled: boolean;
  email_enabled: boolean;
  email_address: string | null;
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  reminder_hours_before: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date and time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`[${now.toISOString()}] Checking appointments for ${todayStr} and ${tomorrowStr}`);
    console.log(`Email service available: ${!!resendApiKey}`);

    // Fetch appointments for today and tomorrow that haven't been reminded
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        user_id,
        status,
        reminder_sent_at,
        clients (name, email, phone),
        services (name)
      `)
      .in('appointment_date', [todayStr, tomorrowStr])
      .is('reminder_sent_at', null)
      .in('status', ['pending', 'confirmed']);

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to remind`);

    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No appointments to remind',
        notificationsSent: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemNotificationsSent = 0;
    let emailsSent = 0;
    const errors: string[] = [];

    // Process each appointment
    for (const appointment of appointments) {
      try {
        const isToday = appointment.appointment_date === todayStr;
        const clientName = (appointment.clients as any)?.name || 'Cliente';
        const clientEmail = (appointment.clients as any)?.email;
        const serviceName = (appointment.services as any)?.name || 'Serviço';
        
        const title = isToday 
          ? 'Agendamento Hoje!' 
          : 'Lembrete de Agendamento';
        
        const message = isToday
          ? `${clientName} tem agendamento hoje às ${appointment.appointment_time} - ${serviceName}`
          : `${clientName} tem agendamento amanhã às ${appointment.appointment_time} - ${serviceName}`;

        // Get user notification preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', appointment.user_id)
          .single();

        const preferences: NotificationPreferences = prefs || {
          system_enabled: true,
          email_enabled: false,
          email_address: null,
          whatsapp_enabled: false,
          whatsapp_number: null,
          reminder_hours_before: 24,
        };

        // 1. Create system notification (always, unless disabled)
        if (preferences.system_enabled !== false) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: appointment.user_id,
              title,
              message,
              type: 'reminder',
              action_url: '/appointments',
            });

          if (notifError) {
            console.error(`Error creating notification for appointment ${appointment.id}:`, notifError);
            errors.push(`System notification ${appointment.id}: ${notifError.message}`);
          } else {
            systemNotificationsSent++;
            console.log(`System notification sent for appointment ${appointment.id}`);
          }
        }

        // 2. Send email notification if enabled (using Resend REST API)
        if (preferences.email_enabled && resendApiKey) {
          const emailTo = preferences.email_address || clientEmail;
          
          if (emailTo) {
            try {
              const dateFormatted = isToday ? 'hoje' : 'amanhã';
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Barbearia <onboarding@resend.dev>',
                  to: [emailTo],
                  subject: title,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h1 style="color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">
                        ${title}
                      </h1>
                      <div style="padding: 20px 0;">
                        <p style="font-size: 16px; color: #555;">
                          Olá <strong>${clientName}</strong>,
                        </p>
                        <p style="font-size: 16px; color: #555;">
                          Este é um lembrete do seu agendamento:
                        </p>
                        <div style="background: #f8fafc; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
                          <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${dateFormatted}</p>
                          <p style="margin: 5px 0;"><strong>🕐 Horário:</strong> ${appointment.appointment_time}</p>
                          <p style="margin: 5px 0;"><strong>✂️ Serviço:</strong> ${serviceName}</p>
                        </div>
                        <p style="font-size: 14px; color: #888;">
                          Em caso de dúvidas, entre em contato conosco.
                        </p>
                      </div>
                      <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center; color: #888; font-size: 12px;">
                        Este é um email automático, por favor não responda.
                      </div>
                    </div>
                  `,
                }),
              });

              if (!emailResponse.ok) {
                const errorData = await emailResponse.text();
                console.error(`Error sending email for appointment ${appointment.id}:`, errorData);
                errors.push(`Email ${appointment.id}: ${errorData}`);
              } else {
                emailsSent++;
                console.log(`Email sent to ${emailTo} for appointment ${appointment.id}`);
              }
            } catch (emailErr) {
              console.error(`Email error for appointment ${appointment.id}:`, emailErr);
              errors.push(`Email ${appointment.id}: ${String(emailErr)}`);
            }
          } else {
            console.log(`No email address available for appointment ${appointment.id}`);
          }
        }

        // 3. WhatsApp notification (placeholder - requires external API like Twilio/Z-API)
        if (preferences.whatsapp_enabled && preferences.whatsapp_number) {
          // TODO: Implement WhatsApp integration
          console.log(`WhatsApp notification would be sent to ${preferences.whatsapp_number} for appointment ${appointment.id}`);
        }

        // Mark appointment as reminded
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ reminder_sent_at: now.toISOString() })
          .eq('id', appointment.id);

        if (updateError) {
          console.error(`Error updating reminder_sent_at for appointment ${appointment.id}:`, updateError);
          errors.push(`Update ${appointment.id}: ${updateError.message}`);
        }

      } catch (err) {
        console.error(`Error processing appointment ${appointment.id}:`, err);
        errors.push(`Appointment ${appointment.id}: ${String(err)}`);
      }
    }

    console.log(`Summary: ${systemNotificationsSent} system notifications, ${emailsSent} emails sent`);

    return new Response(JSON.stringify({ 
      success: true, 
      systemNotificationsSent,
      emailsSent,
      totalAppointments: appointments.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in send-appointment-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
