const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const page = (body, status = 200) => new Response(body, {
  status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=300, s-maxage=300",
  },
});

export default async (request) => {
  const requestUrl = new URL(request.url);
  const slug = (requestUrl.searchParams.get("slug") || "").trim().toLowerCase();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const appBaseUrl = process.env.PUBLIC_APP_BASE_URL || "https://vizzuapp.netlify.app";
  const shareBaseUrl = process.env.PUBLIC_SHARE_BASE_URL || `${appBaseUrl}/s`;

  if (!/^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/.test(slug)) {
    return page("<h1>Link de agendamento não encontrado.</h1>", 404);
  }
  if (!supabaseUrl || !publishableKey) {
    console.error("Missing Supabase configuration for booking-share");
    return page("<h1>Link de agendamento indisponível no momento.</h1>", 503);
  }

  const profileUrl = new URL("/rest/v1/public_business_profile", supabaseUrl);
  profileUrl.searchParams.set("select", "user_id,company_name,slogan,logo_url,banner_url,share_slug,share_title,share_description");
  profileUrl.searchParams.set("share_slug", `eq.${slug}`);
  profileUrl.searchParams.set("limit", "1");

  try {
    const response = await fetch(profileUrl, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` },
    });
    if (!response.ok) throw new Error(`Public profile lookup failed: ${response.status}`);
    const [business] = await response.json();
    if (!business) return page("<h1>Link de agendamento não encontrado.</h1>", 404);

    const bookingUrl = new URL(`/b/${business.user_id}/login`, appBaseUrl).toString();
    const shareUrl = `${shareBaseUrl.replace(/\/$/, "")}/${slug}`;
    const title = business.share_title || `${business.company_name} — Agendamento online`;
    const description = business.share_description || business.slogan || `Agende seu horário na ${business.company_name}.`;
    const image = business.logo_url || business.banner_url || new URL("/pwa-icon-512.png", appBaseUrl).toString();

    return page(`<!doctype html>
<html lang="pt-BR"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="noindex,nofollow">
  <meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}"><meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(image)}">
  <link rel="canonical" href="${escapeHtml(shareUrl)}">
  <script>window.location.replace(${JSON.stringify(bookingUrl)});</script>
</head><body>
  <p>Estamos levando você para o agendamento da ${escapeHtml(business.company_name)}…</p>
  <p><a href="${escapeHtml(bookingUrl)}">Continuar para o agendamento</a></p>
</body></html>`);
  } catch (error) {
    console.error("booking-share failed", error);
    return page("<h1>Link de agendamento indisponível no momento.</h1>", 503);
  }
};
