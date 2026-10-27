import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

interface TranslationResult {
  sourceLanguage: "en";
  targetLanguage: string;
  translatedText: string;
  status: "available" | "unavailable";
  reviewed: boolean;
  reason?: string;
}

const TARGETS: Record<string, string> = {
  tw: "twi",
  ee: "ewe",
  gaa: "gaa",
  fat: "fat",
  dag: "dag",
};

serve(async (req: Request) => {
  if (!allowedOrigin) return json({ error: "ALLOWED_ORIGIN is not configured" }, 503);

  const origin = req.headers.get("Origin");
  if (origin && origin !== allowedOrigin) return json({ error: "Origin not allowed" }, 403);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let target = "tw";

  try {
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    target = typeof body?.target_lang === "string" ? body.target_lang : "tw";
    const targetCode = TARGETS[target];

    if (!text) return json({ error: "Missing 'text'" }, 400);
    if (!targetCode) return json({ error: "Unsupported target language" }, 400);
    if (text.length > 1000) return json({ error: "Text too long" }, 413);

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

    const key = Deno.env.get("GHANA_NLP_KEY");
    if (!key) {
      return json(
        { sourceLanguage: "en", targetLanguage: target, translatedText: "", status: "unavailable", reviewed: false, reason: "not_configured" },
        200
      );
    }

    const { data: requestCount, error: rateLimitError } = await supabase.rpc(
      "consume_translation_rate_limit",
      { target_user_id: userData.user.id }
    );
    if (rateLimitError || typeof requestCount !== "number") {
      console.error("translate-content rate limit unavailable");
      return json({ error: "Rate limiting is unavailable" }, 503);
    }
    if (requestCount > 30) return json({ error: "Rate limit exceeded" }, 429);

    const upstream = await fetch("https://translation-api.ghananlp.org/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": key,
      },
      body: JSON.stringify({ in: text, lang: `eng-${targetCode}` }),
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      console.error("translate-content upstream status", upstream.status, (await upstream.text()).slice(0, 300));
      return json(
        { sourceLanguage: "en", targetLanguage: target, translatedText: "", status: "unavailable", reviewed: false, reason: `upstream_${upstream.status}` },
        200
      );
    }

    const raw: unknown = await upstream.json();
    let translatedText = "";
    if (typeof raw === "string") {
      translatedText = raw;
    } else if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      const candidate = obj.translatedText ?? obj.translation ?? obj.output ?? obj.text;
      if (typeof candidate === "string") translatedText = candidate;
      else if (Array.isArray(candidate) && candidate.length > 0 && typeof candidate[0] === "string") {
        translatedText = candidate[0];
      }
    }

    if (!translatedText.trim()) {
      return json(
        { sourceLanguage: "en", targetLanguage: target, translatedText: "", status: "unavailable", reviewed: false, reason: "empty_result" },
        200
      );
    }

    return json({
      sourceLanguage: "en",
      targetLanguage: target,
      translatedText: translatedText.trim(),
      status: "available",
      reviewed: false,
    }, 200);
  } catch {
    console.error("translate-content request failed");
    return json(
      { sourceLanguage: "en", targetLanguage: target, translatedText: "", status: "unavailable", reviewed: false, reason: "internal_error" },
      200
    );
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
