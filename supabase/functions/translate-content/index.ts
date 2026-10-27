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

const TARGETS: Record<string, { pair: string; name: string }> = {
  tw: { pair: "twi", name: "Twi" },
  ee: { pair: "ewe", name: "Ewe" },
  gaa: { pair: "gaa", name: "Ga" },
  fat: { pair: "fat", name: "Fante" },
  dag: { pair: "dag", name: "Dagbani" },
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
    const targetInfo = TARGETS[target];

    if (!text) return json({ error: "Missing 'text'" }, 400);
    if (!targetInfo) return json({ error: "Unsupported target language" }, 400);
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

    const { data: requestCount, error: rateLimitError } = await supabase.rpc(
      "consume_translation_rate_limit",
      { target_user_id: userData.user.id }
    );
    if (rateLimitError || typeof requestCount !== "number") {
      console.error("translate-content rate limit unavailable");
      return json({ error: "Rate limiting is unavailable" }, 503);
    }
    if (requestCount > 30) return json({ error: "Rate limit exceeded" }, 429);

    let translatedText = await translateWithKhaya(text, targetInfo.pair);
    if (!translatedText) translatedText = await translateWithGoogle(text, targetInfo.name);

    if (!translatedText) {
      return json(
        { sourceLanguage: "en", targetLanguage: target, translatedText: "", status: "unavailable", reviewed: false, reason: "upstream_unavailable" },
        200
      );
    }

    return json({
      sourceLanguage: "en",
      targetLanguage: target,
      translatedText,
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

async function translateWithKhaya(text: string, pair: string): Promise<string> {
  const key = Deno.env.get("GHANA_NLP_KEY");
  if (!key) return "";

  try {
    const upstream = await fetch("https://translation-api.ghananlp.org/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": key,
      },
      body: JSON.stringify({ in: text, lang: `eng-${pair}` }),
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      console.error("khaya upstream status", upstream.status, (await upstream.text()).slice(0, 200));
      return "";
    }

    const raw: unknown = await upstream.json();
    if (typeof raw === "string") return raw.trim();
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      const candidate = obj.translatedText ?? obj.translation ?? obj.output ?? obj.text;
      if (typeof candidate === "string") return candidate.trim();
      if (Array.isArray(candidate) && candidate.length > 0 && typeof candidate[0] === "string") {
        return candidate[0].trim();
      }
    }
    return "";
  } catch (err) {
    console.error("khaya call failed", err);
    return "";
  }
}

/**
 * Google fallback using a light model dedicated to translation, so the chat
 * models keep their own quota. Used when Khaya is out of call volume.
 */
async function translateWithGoogle(text: string, languageName: string): Promise<string> {
  const key = Deno.env.get("GEMMA_API_KEY");
  if (!key) return "";

  const models = [
    Deno.env.get("TRANSLATE_MODEL") ?? "gemini-3.1-flash-lite",
    Deno.env.get("TRANSLATE_FALLBACK_MODEL") ?? "gemini-3.1-flash-lite-preview",
  ];

  for (const model of models) {
    try {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text:
                  `Translate the user's text from English into ${languageName}. ` +
                  "Reply with the translation only, with no notes or explanations. " +
                  "Keep numbers such as 112 and placeholders such as {count} unchanged.",
              }],
            },
            contents: [{ role: "user", parts: [{ text }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!upstream.ok) {
        console.error("google translate status", model, upstream.status);
        continue;
      }

      const raw = (await upstream.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: unknown; thought?: unknown }> } }>;
      } | null;

      const translated = (raw?.candidates?.[0]?.content?.parts ?? [])
        .filter((p) => !p.thought)
        .map((p) => (typeof p.text === "string" ? p.text : ""))
        .join("")
        .trim();

      if (translated) return translated;
    } catch (err) {
      console.error("google translate call failed", model, err);
    }
  }

  return "";
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
