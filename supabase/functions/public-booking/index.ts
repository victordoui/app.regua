import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://vizzuapp.netlify.app",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);
const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && (allowedOrigins.has(origin) || /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/i.test(origin))
    ? origin
    : "https://vizzuapp.netlify.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const jsonResponse = (body: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const hashValue = async (value: string, key: string) => {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

Deno.serve(async request => {
  const origin = request.headers.get("origin");
  const cors = getCorsHeaders(origin);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (origin && !allowedOrigins.has(origin) && !/^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/i.test(origin)) {
    return jsonResponse({ error: "ORIGIN_NOT_ALLOWED" }, 403, origin);
  }
  if (request.method !== "POST") return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("public-booking configuration is incomplete");
    return jsonResponse({ error: "BOOKING_UNAVAILABLE" }, 503, origin);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 32_000) return jsonResponse({ error: "REQUEST_TOO_LARGE" }, 413, origin);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(await request.text());
    if (!isObject(parsed)) throw new Error("Invalid body");
    body = parsed;
  } catch {
    return jsonResponse({ error: "INVALID_REQUEST" }, 400, origin);
  }

  const businessId = typeof body.businessUserId === "string" ? body.businessUserId : "";
  const responsible = isObject(body.responsible) ? body.responsible : {};
  const name = typeof responsible.name === "string" ? responsible.name.trim() : "";
  const phone = typeof responsible.phone === "string" ? responsible.phone.replace(/\D/g, "") : "";
  const participants = Array.isArray(body.participants) ? body.participants : [];

  if (!uuidPattern.test(businessId) || name.length < 2 || name.length > 100 || phone.length < 10 || phone.length > 15) {
    return jsonResponse({ error: "RESPONSIBLE_REQUIRED" }, 400, origin);
  }
  if (participants.length < 1 || participants.length > 5 || !participants.every(participant => {
    if (!isObject(participant)) return false;
    return typeof participant.name === "string"
      && participant.name.trim().length >= 2
      && participant.name.trim().length <= 100
      && typeof participant.professionalId === "string"
      && uuidPattern.test(participant.professionalId)
      && typeof participant.date === "string"
      && /^\d{4}-\d{2}-\d{2}$/.test(participant.date)
      && typeof participant.time === "string"
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(participant.time)
      && Array.isArray(participant.serviceIds)
      && participant.serviceIds.length >= 1
      && participant.serviceIds.length <= 5
      && participant.serviceIds.every(id => typeof id === "string" && uuidPattern.test(id));
  })) {
    return jsonResponse({ error: "INVALID_PARTICIPANTS" }, 400, origin);
  }

  const ip = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const [phoneHash, ipHash] = await Promise.all([
      hashValue(phone, serviceRoleKey),
      hashValue(ip, serviceRoleKey),
    ]);
    const { data: withinLimit, error: limitError } = await supabase.rpc("consume_public_booking_rate_limit", {
      _business_id: businessId,
      _phone_hash: phoneHash,
      _ip_hash: ipHash,
    });
    if (limitError) {
      console.error("public-booking rate limit check failed", limitError.code || "unknown");
      return jsonResponse({ error: "BOOKING_UNAVAILABLE" }, 503, origin);
    }
    if (withinLimit !== true) return jsonResponse({ error: "RATE_LIMITED" }, 429, origin);

    const { data, error } = await supabase.rpc("book_group_appointments", {
      _barbershop_user_id: businessId,
      _responsible: {
        name,
        phone,
        email: typeof responsible.email === "string" ? responsible.email.trim().toLowerCase() : "",
      },
      _participants: participants,
      _notes: typeof body.notes === "string" ? body.notes.slice(0, 1000) : null,
    });
    if (error) {
      console.error("public-booking request rejected", error.code || "unknown");
      const status = error.message.includes("SLOT_UNAVAILABLE") || error.message.includes("PROFESSIONAL_BLOCKED") ? 409
        : error.message.includes("BUSINESS_NOT_AVAILABLE") ? 404
        : error.message.includes("AUTH_REQUIRED") || error.code === "42501" ? 403
        : 400;
      const code = error.message.includes("SLOT_UNAVAILABLE") ? "SLOT_UNAVAILABLE"
        : error.message.includes("PROFESSIONAL_BLOCKED") ? "PROFESSIONAL_BLOCKED"
        : error.message.includes("BUSINESS_NOT_AVAILABLE") ? "BUSINESS_NOT_AVAILABLE"
        : error.message.includes("OUTSIDE_BUSINESS_HOURS") ? "OUTSIDE_BUSINESS_HOURS"
        : error.message.includes("SLOT_IN_PAST") ? "SLOT_IN_PAST"
        : "BOOKING_NOT_COMPLETED";
      return jsonResponse({ error: code }, status, origin);
    }
    return jsonResponse({ data }, 200, origin);
  } catch {
    console.error("public-booking unexpected failure");
    return jsonResponse({ error: "BOOKING_UNAVAILABLE" }, 500, origin);
  }
});
