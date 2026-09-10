const page = (body, status = 200) => new Response(body, {
  status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=300, s-maxage=300",
  },
});

export default async (request) => {
  const requestUrl = new URL(request.url);
  const slug = (requestUrl.searchParams.get("slug") || requestUrl.pathname.split("/").filter(Boolean).at(-1) || "")
    .trim()
    .toLowerCase();

  if (!/^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/.test(slug)) {
    return page("<h1>Link de agendamento não encontrado.</h1>", 404);
  }

  try {
    const upstream = await fetch(`https://yjuqixthmwgnzkjummaf.supabase.co/functions/v1/booking-share/${encodeURIComponent(slug)}`);
    const html = await upstream.text();
    return page(html, upstream.status);
  } catch (error) {
    console.error("booking-share proxy failed", error);
    return page("<h1>Link de agendamento indisponível no momento.</h1>", 503);
  }
};
