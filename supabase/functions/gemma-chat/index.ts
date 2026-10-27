import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

const LANGUAGES: Record<string, { name: string; description: string }> = {
  en: { name: "English", description: "" },
  tw: { name: "Twi", description: "Twi (Akan) is a Ghanaian language." },
  ee: { name: "Ewe", description: "Ewe (Eʋegbe) is a Ghanaian language spoken in the Volta Region." },
  gaa: {
    name: "Ga",
    description: "Ga is the Ghanaian language spoken in and around Accra. Use Ga, never Irish.",
  },
  fat: { name: "Fante", description: "Fante (Mfantse) is a Ghanaian language of the Central Region." },
  dag: { name: "Dagbani", description: "Dagbani is a Ghanaian language of northern Ghana." },
};

function systemInstruction(language: { name: string; description: string }): string {
  const replyStyle =
    language.name === "English"
      ? "Answer in plain, short English"
      : `Answer in plain, short ${language.name}. ${language.description} ` +
        "Keep medicine names and emergency numbers in English";

  return (
    "You are a health-education assistant inside SymptoCare, an educational app for Ghana. " +
    `${replyStyle} using only widely accepted general information. ` +
    "You must never give a diagnosis, prescribe or recommend medicine, or replace a doctor, pharmacist, or emergency services. " +
    "If the question is about an emergency, severe symptoms, or someone who is seriously ill or injured, tell them to call 112 or go to the nearest health facility immediately. " +
    "If you are not sure, say so. " +
    "When web search results are supplied, use only those results and do not add facts that are missing from them."
  );
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
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const requested = typeof body?.language === "string" ? body.language : "en";
    const language = LANGUAGES[requested] ?? LANGUAGES.en;

    if (!prompt) return json({ error: "Missing 'prompt'" }, 400);
    if (prompt.length > 4000) return json({ error: "Prompt too long" }, 413);

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

    const key = Deno.env.get("GEMMA_API_KEY");
    if (!key) {
      return json({ status: "unavailable", answer: "", reason: "not_configured" }, 200);
    }

    const { data: requestCount, error: rateLimitError } = await supabase.rpc(
      "consume_gemma_rate_limit",
      { target_user_id: userData.user.id }
    );
    if (rateLimitError || typeof requestCount !== "number") {
      console.error("gemma-chat rate limit unavailable");
      return json({ error: "Rate limiting is unavailable" }, 503);
    }
    if (requestCount > 30) return json({ error: "Rate limit exceeded" }, 429);

    const primaryModel = Deno.env.get("GEMMA_MODEL") ?? "gemini-3.5-flash-lite";
    const fallbackModel = Deno.env.get("GEMMA_FALLBACK_MODEL") ?? "gemma-4-26b-a4b-it";
    const secondFallbackModel = Deno.env.get("GEMMA_SECOND_FALLBACK_MODEL") ?? "gemini-3.1-flash-lite";

    let answer = "";
    const deadline = Date.now() + 55000;
    for (const model of [primaryModel, fallbackModel, secondFallbackModel]) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const remaining = deadline - Date.now();
        if (remaining < 3000) break;
        answer = await requestAnswer(model, key, prompt, language, Math.min(20000, remaining));
        if (answer) break;
        await delay(600);
      }
      if (answer) break;
    }

    if (!answer) {
      return json({ status: "unavailable", answer: "", reason: "model_unavailable" }, 200);
    }

    return json({ status: "available", answer }, 200);
  } catch (err) {
    console.error("gemma-chat request failed", err);
    return json({ status: "unavailable", answer: "", reason: "internal_error" }, 200);
  }
});

async function requestAnswer(
  model: string,
  key: string,
  prompt: string,
  language: { name: string; description: string },
  timeoutMs: number
): Promise<string> {
  try {
    const endpoint =
      Deno.env.get("GEMMA_API_URL") ??
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction(language) }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1600 },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!upstream.ok) {
      console.error("gemma-chat upstream status", model, upstream.status);
      return "";
    }

    const raw = (await upstream.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: unknown; thought?: unknown }> } }>;
    } | null;

    const parts = raw?.candidates?.[0]?.content?.parts ?? [];
    return parts
      .filter((p) => !p.thought)
      .map((p) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim();
  } catch (err) {
    console.error("gemma-chat model call failed", model, err);
    return "";
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
