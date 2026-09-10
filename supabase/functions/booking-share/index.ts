import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const htmlResponse = (body: string, status = 200) => new Response(body, {
  status,
  headers: {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=300, s-maxage=300",
  },
});

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const rawBusiness = url.searchParams.get("business") || url.pathname.split("/").filter(Boolean).at(-1) || "";
  const businessId = rawBusiness.match(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i)?.[0];
  const slug = businessId ? null : rawBusiness.toLowerCase();

  if ((!businessId && !slug) || (businessId && !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(businessId))) {
    return htmlResponse("<h1>Link de agendamento inválido</h1>", 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  let defaultPublishableKey: string | undefined;
  if (publishableKeys) {
    try { defaultPublishableKey = JSON.parse(publishableKeys)?.default; } catch { /* optional */ }
  }
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || defaultPublishableKey;
  const appUrl = Deno.env.get("PUBLIC_APP_URL");

  if (!supabaseUrl || !anonKey || !appUrl) {
    console.error("Missing booking-share function configuration");
    return htmlResponse("<h1>Link de agendamento indisponível</h1>", 503);
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const { data: business, error } = await supabase
    .from("public_business_profile")
    .select("user_id, company_name, slogan, logo_url, banner_url, share_slug, share_title, share_description")
    .eq(businessId ? "user_id" : "share_slug", businessId || slug)
    .maybeSingle();

  if (error || !business) {
    return htmlResponse("<h1>Negócio não encontrado</h1>", 404);
  }

  const bookingUrl = new URL(`/b/${business.user_id}/login`, appUrl).toString();
  const title = business.share_title || `${business.company_name} — Agendamento online`;
  const description = business.share_description || business.slogan || `Agende seu horário na ${business.company_name}.`;
  const image = business.logo_url || business.banner_url || new URL("/pwa-icon-512.png", appUrl).toString();
  const shareUrl = url.toString();

  return htmlResponse(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="noindex,nofollow">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:url" content="${escapeHtml(shareUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <link rel="canonical" href="${escapeHtml(bookingUrl)}">
    <script>window.location.replace(${JSON.stringify(bookingUrl)});</script>
  </head>
  <body>
    <p>Estamos levando você para o agendamento da ${escapeHtml(business.company_name)}…</p>
    <p><a href="${escapeHtml(bookingUrl)}">Continuar para o agendamento</a></p>
  </body>
</html>`);
});
