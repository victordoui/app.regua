import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);

  try {
    const { email, password, fullName, phone, businessId, website } = await request.json();
    if (website) return json({ error: "Não foi possível criar a conta." }, 400);

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(fullName || "").trim();
    const normalizedPhone = String(phone || "").replace(/\D/g, "");
    const normalizedBusinessId = String(businessId || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      || String(password || "").length < 6
      || normalizedName.length < 3
      || !/^\d{10,11}$/.test(normalizedPhone)
      || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(normalizedBusinessId)) {
      return json({ error: "Confira os dados informados e tente novamente." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) return json({ error: "Cadastro temporariamente indisponível." }, 503);

    const publicClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: business } = await publicClient
      .from("public_business_profile")
      .select("user_id")
      .eq("user_id", normalizedBusinessId)
      .maybeSingle();
    if (!business) return json({ error: "Página de agendamento indisponível." }, 404);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: { full_name: normalizedName, phone: normalizedPhone },
      app_metadata: { signup_kind: "client" },
    });

    if (error) {
      console.error("create-client-account failed", error.message);
      return json({ error: "Não foi possível criar a conta. Se já possui cadastro, tente entrar." }, 400);
    }

    return json({ created: true });
  } catch (error) {
    console.error("create-client-account unexpected error", error);
    return json({ error: "Cadastro temporariamente indisponível." }, 500);
  }
});
