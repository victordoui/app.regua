const page = (body, status = 200) => new Response(body, {
  status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=300, s-maxage=300",
  },
});

export default async (request) => {
  const requestUrl = new URL(request.url);
  const functionPath = requestUrl.pathname.split("/.netlify/functions/booking-share/")[1] || "";
  const businessKey = (requestUrl.searchParams.get("slug") || functionPath.split("/")[0] || "")
    .trim()
    .toLowerCase();
  const legacyIdMatch = businessKey.match(/-([0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})$/i);
  const businessId = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(businessKey)
    ? businessKey
    : legacyIdMatch?.[1];
  const isBusinessId = Boolean(businessId);

  if (!isBusinessId && !/^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/.test(businessKey)) {
    return page("<h1>Link de agendamento não encontrado.</h1>", 404);
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://yjuqixthmwgnzkjummaf.supabase.co";
    const upstreamUrl = isBusinessId
      ? `${supabaseUrl}/functions/v1/booking-share?business=${encodeURIComponent(businessId)}`
      : `${supabaseUrl}/functions/v1/booking-share/${encodeURIComponent(businessKey)}`;
    const upstream = await fetch(upstreamUrl);
    const html = (await upstream.text()).replace(
      /(\/b\/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})\/login(?=["'])/gi,
      "$1/agendar",
    );
    return page(html, upstream.status);
  } catch {
    console.error("booking-share proxy failed");
    return page("<h1>Link de agendamento indisponível no momento.</h1>", 503);
  }
};
