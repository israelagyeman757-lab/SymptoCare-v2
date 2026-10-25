import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

interface WebSearchResult {
  title: string;
  url: string;
  description: string;
}

serve(async (req: Request) => {
  if (!allowedOrigin) return json({ error: "ALLOWED_ORIGIN is not configured" }, 503);

  const origin = req.headers.get("Origin");
  if (origin && origin !== allowedOrigin) return json({ error: "Origin not allowed" }, 403);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) return json({ error: "Missing 'query'" }, 400);
    if (query.length > 200) return json({ error: "Query too long" }, 413);

    const authorization = req.headers.get("Authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Rate limiting is not configured" }, 503);

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const key = Deno.env.get("BRAVE_SEARCH_API_KEY");
    if (!key) {
      return json({ status: "unavailable", results: [], reason: "not_configured" }, 200);
    }

    const { data: requestCount, error: rateLimitError } = await supabase.rpc(
      "consume_search_rate_limit",
      { target_user_id: userData.user.id }
    );
    if (rateLimitError || typeof requestCount !== "number") {
      console.error("search-content rate limit unavailable");
      return json({ error: "Rate limiting is unavailable" }, 503);
    }
    if (requestCount > 30) return json({ error: "Rate limit exceeded" }, 429);

    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", "5");
    url.searchParams.set("search_lang", "en");

    const upstream = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": key,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      return json({ status: "unavailable", results: [], reason: `upstream_${upstream.status}` }, 200);
    }

    const raw = await upstream.json() as {
      web?: { results?: Array<{ title?: unknown; url?: unknown; description?: unknown }> };
    } | null;

    const results: WebSearchResult[] = (raw?.web?.results ?? [])
      .slice(0, 5)
      .map((r) => ({
        title: typeof r.title === "string" ? r.title : "",
        url: typeof r.url === "string" ? r.url : "",
        description: typeof r.description === "string" ? r.description : "",
      }))
      .filter((r) => r.title && r.url);

    if (results.length === 0) {
      return json({ status: "unavailable", results: [], reason: "empty_result" }, 200);
    }

    return json({ status: "available", results }, 200);
  } catch {
    console.error("search-content request failed");
    return json({ status: "unavailable", results: [], reason: "internal_error" }, 200);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
