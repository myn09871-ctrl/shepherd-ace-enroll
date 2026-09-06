const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const clientId = Deno.env.get("GMAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    return new Response(JSON.stringify({ ok: false, error: "missing credentials" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  const data = await res.json();
  return new Response(JSON.stringify({
    ok: !!data.access_token,
    status: res.status,
    scope: data.scope ?? null,
    expires_in: data.expires_in ?? null,
    error: data.error ?? null,
    error_description: data.error_description ?? null,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
