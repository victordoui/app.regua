import { afterEach, describe, expect, it, vi } from "vitest";
import bookingShare from "./booking-share.mjs";

const businessId = "7aca9a68-a3fc-4c8c-a1fc-fd7039c0e6c8";
const legacyHtml = [
  "<!doctype html>",
  "<html lang=\"pt-BR\"><head>",
  "<title>Marshalls Barber — Agendamento online</title>",
  "<meta property=\"og:image\" content=\"https://storage.example/public-assets/logos/marshalls.png\">",
  "<link rel=\"canonical\" href=\"https://vizzuapp.netlify.app/b/" + businessId + "/login\">",
  "<script>window.location.replace(\"https://vizzuapp.netlify.app/b/" + businessId + "/login\");</script>",
  "</head><body><a href=\"https://vizzuapp.netlify.app/b/" + businessId + "/login\">Continuar</a></body></html>",
].join("\n");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Netlify booking share proxy", () => {
  it.each([
    {
      key: "marshalls-barber",
      expectedPath: "/functions/v1/booking-share/marshalls-barber",
      expectedBusiness: null,
    },
    {
      key: businessId,
      expectedPath: "/functions/v1/booking-share",
      expectedBusiness: businessId,
    },
    {
      key: "marshalls-barber-" + businessId,
      expectedPath: "/functions/v1/booking-share",
      expectedBusiness: businessId,
    },
  ])("serves company metadata and a public destination for $key", async ({
    key,
    expectedPath,
    expectedBusiness,
  }) => {
    const upstreamFetch = vi.fn(async () => new Response(legacyHtml, { status: 200 }));
    vi.stubGlobal("fetch", upstreamFetch);
    vi.stubEnv("SUPABASE_URL", "https://supabase.example");

    const response = await bookingShare(new Request(
      "https://vizzuapp.netlify.app/.netlify/functions/booking-share/" + key,
    ));
    const html = await response.text();
    const upstreamUrl = new URL(upstreamFetch.mock.calls[0][0]);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(html).toContain("Marshalls Barber — Agendamento online");
    expect(html).toContain("og:image");
    expect(html).toContain("/b/" + businessId + "/agendar");
    expect(html).not.toContain("/b/" + businessId + "/login");
    expect(upstreamUrl.origin).toBe("https://supabase.example");
    expect(upstreamUrl.pathname).toBe(expectedPath);
    expect(upstreamUrl.searchParams.get("business")).toBe(expectedBusiness);
  });
});
