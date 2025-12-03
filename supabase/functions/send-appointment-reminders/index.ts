import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date and time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking appointments for ${todayStr} and ${tomorrowStr}`);

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
        clients:profiles!client_id (display_name),
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

    let notificationsSent = 0;
    const errors: string[] = [];

    // Create notifications for each appointment
    for (const appointment of appointments) {
      try {
        const isToday = appointment.appointment_date === todayStr;
        const clientName = (appointment.clients as any)?.display_name || 'Cliente';
        const serviceName = (appointment.services as any)?.name || 'Serviço';
        
        const title = isToday 
          ? 'Agendamento Hoje!' 
          : 'Lembrete de Agendamento';
        
        const message = isToday
          ? `${clientName} tem agendamento hoje às ${appointment.appointment_time} - ${serviceName}`
          : `${clientName} tem agendamento amanhã às ${appointment.appointment_time} - ${serviceName}`;

        // Create notification
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
          errors.push(`Appointment ${appointment.id}: ${notifError.message}`);
          continue;
        }

        // Mark appointment as reminded
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ reminder_sent_at: now.toISOString() })
          .eq('id', appointment.id);

        if (updateError) {
          console.error(`Error updating reminder_sent_at for appointment ${appointment.id}:`, updateError);
          errors.push(`Appointment ${appointment.id} update: ${updateError.message}`);
          continue;
        }

        notificationsSent++;
        console.log(`Notification sent for appointment ${appointment.id}`);
      } catch (err) {
        console.error(`Error processing appointment ${appointment.id}:`, err);
        errors.push(`Appointment ${appointment.id}: ${String(err)}`);
      }
    }

    console.log(`Successfully sent ${notificationsSent} notifications`);

    return new Response(JSON.stringify({ 
      success: true, 
      notificationsSent,
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
