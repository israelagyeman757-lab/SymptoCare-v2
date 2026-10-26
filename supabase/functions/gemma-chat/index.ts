import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

const SYSTEM_INSTRUCTION =
  "You are a health-education assistant inside SymptoCare, an educational app for Ghana. " +
  "Answer in plain, short English using only widely accepted general information. " +
  "You must never give a diagnosis, prescribe or recommend medicine, or replace a doctor, pharmacist, or emergency services. " +
  "If the question is about an emergency, severe symptoms, or someone who is seriously ill or injured, tell them to call 112 or go to the nearest health facility immediately. " +
  "If you are not sure, say so.";

interface GemmaResult {
  status: "available" | "unavailable";
  answer: string;
  reason?: string;
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

    if (!prompt) return json({ error: "Missing 'prompt'" }, 400);
    if (prompt.length > 500) return json({ error: "Prompt too long" }, 413);

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

    const model = Deno.env.get("GEMMA_MODEL") ?? "gemma-4-26b-a4b-it";
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
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!upstream.ok) {
      console.error("gemma-chat upstream status", upstream.status);
      return json({ status: "unavailable", answer: "", reason: `upstream_${upstream.status}` }, 200);
    }

    const raw = (await upstream.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: unknown; thought?: unknown }> } }>;
    } | null;

    const parts = raw?.candidates?.[0]?.content?.parts ?? [];
    const answer = parts
      .filter((p) => !p.thought)
      .map((p) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim();

    if (!answer) {
      return json({ status: "unavailable", answer: "", reason: "empty_result" }, 200);
    }

    return json({ status: "available", answer }, 200);
  } catch (err) {
    console.error("gemma-chat request failed", err);
    return json({ status: "unavailable", answer: "", reason: "internal_error" }, 200);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
