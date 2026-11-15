import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  dueReminderLeads,
  formatAppointmentInSaoPaulo,
} from "../_shared/appointmentReminderWindows.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Content-Type": "application/json; charset=utf-8",
};

type Preferences = {
  system_enabled: boolean | null;
  email_enabled: boolean | null;
  email_address: string | null;
};

type AppointmentRow = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  user_id: string;
  client_id: string;
  status: string;
  reminder_24h_sent_at: string | null;
  reminder_2h_sent_at: string | null;
  clients:
    | { name: string | null; email: string | null; phone: string | null }
    | { name: string | null; email: string | null; phone: string | null }[]
    | null;
  services: { name: string | null } | { name: string | null }[] | null;
};

function constantTimeEquals(left: string, right: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a[index] ^ b[index];
  }
  return difference === 0;
}

function localDateRange(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const today = values.year + "-" + values.month + "-" + values.day;
  const tomorrowDate = new Date(today + "T12:00:00Z");
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
  return { today, tomorrow: tomorrowDate.toISOString().slice(0, 10) };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] || character);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const expectedSecret = Deno.env.get("REMINDER_CRON_SECRET");
  const suppliedSecret = request.headers.get("x-cron-secret") || "";
  if (!expectedSecret) {
    return jsonResponse({
      success: false,
      error: "Reminder job is not configured",
    }, 503);
  }
  if (!constantTimeEquals(suppliedSecret, expectedSecret)) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({
      success: false,
      error: "Reminder service is not configured",
    }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const now = new Date();
  const { today, tomorrow } = localDateRange(now);
  const { data: appointments, error: appointmentError } = await supabase
    .from("appointments")
    .select(
      "id, appointment_date, appointment_time, user_id, client_id, status, reminder_24h_sent_at, reminder_2h_sent_at, clients(name, email, phone), services(name)",
    )
    .gte("appointment_date", today)
    .lte("appointment_date", tomorrow)
    .eq("status", "confirmed")
    .not("user_id", "is", null);

  if (appointmentError) {
    console.error(
      "Unable to load reminder appointments:",
      appointmentError.message,
    );
    return jsonResponse({
      success: false,
      error: "Unable to load appointments",
    }, 500);
  }

  const candidates = (appointments || []) as AppointmentRow[];
  const dueAppointments = candidates.flatMap((appointment) =>
    dueReminderLeads(
      appointment.appointment_date,
      appointment.appointment_time,
      now,
    )
      .filter((leadHours) =>
        leadHours === 24
          ? !appointment.reminder_24h_sent_at
          : !appointment.reminder_2h_sent_at
      )
      .map((leadHours) => ({ appointment, leadHours }))
  );

  if (dueAppointments.length === 0) {
    return jsonResponse({
      success: true,
      checked: candidates.length,
      remindersSent: 0,
      skipped: 0,
    });
  }

  const clientIds = [
    ...new Set(dueAppointments.map(({ appointment }) => appointment.client_id)),
  ];
  const businessIds = [
    ...new Set(dueAppointments.map(({ appointment }) => appointment.user_id)),
  ];
  const { data: clientProfiles, error: profilesError } = await supabase
    .from("client_profiles")
    .select("user_id, client_id, barbershop_user_id")
    .in("client_id", clientIds)
    .in("barbershop_user_id", businessIds);

  if (profilesError) {
    console.error("Unable to load reminder recipients:", profilesError.message);
    return jsonResponse({
      success: false,
      error: "Unable to load reminder recipients",
    }, 500);
  }

  const profileByClientAndBusiness = new Map(
    (clientProfiles || []).map((profile) => [
      profile.client_id + ":" + profile.barbershop_user_id,
      profile.user_id,
    ]),
  );
  const preferenceUserIds = [
    ...new Set([
      ...businessIds,
      ...(clientProfiles || []).map((profile) => profile.user_id),
    ]),
  ];
  const { data: preferences, error: preferencesError } = await supabase
    .from("notification_preferences")
    .select(
      "user_id, system_enabled, email_enabled, email_address",
    )
    .in("user_id", preferenceUserIds);

  if (preferencesError) {
    console.error(
      "Unable to load reminder preferences:",
      preferencesError.message,
    );
    return jsonResponse({
      success: false,
      error: "Unable to load reminder preferences",
    }, 500);
  }

  const preferencesByUser = new Map<string, Preferences>(
    (preferences || []).map((item) => [item.user_id, item as Preferences]),
  );
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  let notificationsSent = 0;
  let emailsSent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const { appointment, leadHours } of dueAppointments) {
    const marker = leadHours === 24
      ? "reminder_24h_sent_at"
      : "reminder_2h_sent_at";
    const { data: claimedAppointment, error: claimError } = await supabase.from(
      "appointments",
    )
      .update({ [marker]: now.toISOString() })
      .eq("id", appointment.id)
      .is(marker, null)
      .select("id")
      .maybeSingle();
    if (claimError) {
      console.error(
        "Unable to claim appointment reminder:",
        claimError.message,
      );
      errors.push("claim:" + appointment.id + ":" + leadHours);
      continue;
    }
    if (!claimedAppointment) {
      skipped += 1;
      continue;
    }

    let clientDelivered = false;
    try {
      const clientAuthId = profileByClientAndBusiness.get(
        appointment.client_id + ":" + appointment.user_id,
      );
      const client = Array.isArray(appointment.clients)
        ? appointment.clients[0]
        : appointment.clients;
      const clientName = client?.name || "Cliente";
      const service = Array.isArray(appointment.services)
        ? appointment.services[0]
        : appointment.services;
      const serviceName = service?.name || "Atendimento";
      const appointmentLabel = formatAppointmentInSaoPaulo(
        appointment.appointment_date,
        appointment.appointment_time,
      );
      const title = leadHours === 24
        ? "Seu atendimento é amanhã"
        : "Seu atendimento começa em 2 horas";
      const clientMessage = serviceName + " em " + appointmentLabel +
        ". Esperamos por você!";
      const clientPreferences = clientAuthId
        ? preferencesByUser.get(clientAuthId)
        : null;
      if (clientAuthId && clientPreferences?.system_enabled !== false) {
        const { error } = await supabase.from("client_notifications").insert({
          user_id: clientAuthId,
          business_user_id: appointment.user_id,
          appointment_id: appointment.id,
          lead_hours_before: leadHours,
          title,
          message: clientMessage,
          action_url: "/b/" + appointment.user_id + "/home",
        });

        if (error && error.code !== "23505") {
          console.error("Unable to create client reminder:", error.message);
          errors.push(
            "client-notification:" + appointment.id + ":" + leadHours,
          );
        } else {
          clientDelivered = true;
          if (!error) notificationsSent += 1;
        }
      }

      const businessPreferences = preferencesByUser.get(appointment.user_id);
      const clientEmail = businessPreferences?.email_address || client?.email;
      if (
        businessPreferences?.email_enabled && clientEmail && resendApiKey &&
        resendFromEmail
      ) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + resendApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: resendFromEmail,
              to: [clientEmail],
              subject: title,
              html: "<p>Olá " + escapeHtml(clientName) +
                ",</p><p>Seu atendimento de <strong>" +
                escapeHtml(serviceName) + "</strong> está marcado para " +
                escapeHtml(appointmentLabel) + ".</p>",
            }),
          });
          if (!emailResponse.ok) {
            console.error(
              "Unable to send appointment reminder email:",
              emailResponse.status,
            );
            errors.push("client-email:" + appointment.id + ":" + leadHours);
          } else {
            emailsSent += 1;
            clientDelivered = true;
          }
        } catch (error) {
          console.error(
            "Appointment reminder email request failed:",
            error instanceof Error ? error.message : "unknown error",
          );
          errors.push("client-email:" + appointment.id + ":" + leadHours);
        }
      }

      if (!clientDelivered) {
        const { error } = await supabase.from("appointments")
          .update({ [marker]: null })
          .eq("id", appointment.id)
          .eq(marker, now.toISOString());
        if (error) {
          console.error(
            "Unable to release appointment reminder:",
            error.message,
          );
          errors.push("release:" + appointment.id + ":" + leadHours);
        }
        skipped += 1;
      }
    } catch (error) {
      console.error(
        "Unable to process appointment reminder:",
        error instanceof Error ? error.message : "unknown error",
      );
      errors.push("process:" + appointment.id + ":" + leadHours);
      if (!clientDelivered) {
        const { error: releaseError } = await supabase.from("appointments")
          .update({ [marker]: null })
          .eq("id", appointment.id)
          .eq(marker, now.toISOString());
        if (releaseError) {
          console.error(
            "Unable to release failed appointment reminder:",
            releaseError.message,
          );
          errors.push("release:" + appointment.id + ":" + leadHours);
        }
      }
    }
  }

  return jsonResponse({
    success: errors.length === 0,
    checked: candidates.length,
    due: dueAppointments.length,
    notificationsSent,
    emailsSent,
    skipped,
    errors: errors.length ? errors : undefined,
  });
});
