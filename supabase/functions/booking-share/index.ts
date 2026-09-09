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
  const businessId = url.searchParams.get("business") || url.pathname.split("/").filter(Boolean).at(-1);

  if (!businessId || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(businessId)) {
    return htmlResponse("<h1>Link de agendamento inválido</h1>", 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const appUrl = Deno.env.get("PUBLIC_APP_URL");

  if (!supabaseUrl || !anonKey || !appUrl) {
    console.error("Missing booking-share function configuration");
    return htmlResponse("<h1>Link de agendamento indisponível</h1>", 503);
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const { data: business, error } = await supabase
    .from("public_business_profile")
    .select("company_name, slogan, logo_url, banner_url, meta_title, meta_description")
    .eq("user_id", businessId)
    .maybeSingle();

  if (error || !business) {
    return htmlResponse("<h1>Negócio não encontrado</h1>", 404);
  }

  const bookingUrl = new URL(`/b/${businessId}/login`, appUrl).toString();
  const title = business.meta_title || `${business.company_name} — Agendamento online`;
  const description = business.meta_description || business.slogan || `Agende seu horário na ${business.company_name}.`;
  const image = business.logo_url || business.banner_url || new URL("/pwa-icon-512.png", appUrl).toString();

  return htmlResponse(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:url" content="${escapeHtml(bookingUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <link rel="canonical" href="${escapeHtml(bookingUrl)}">
    <meta http-equiv="refresh" content="0; url=${escapeHtml(bookingUrl)}">
  </head>
  <body>
    <p>Redirecionando para <a href="${escapeHtml(bookingUrl)}">${escapeHtml(business.company_name)}</a>…</p>
  </body>
</html>`);
});
