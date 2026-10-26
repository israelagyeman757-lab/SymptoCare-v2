import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

const PROMPT =
  "Look at this photo of a medicine packet or label. " +
  'Reply with ONLY the medicine name (generic or brand), with no other words. ' +
  'If you cannot read any medicine name, reply with the single word "UNREADABLE".';

interface PhotoResult {
  status: "available" | "unavailable";
  name: string;
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
    const image = typeof body?.image === "string" ? body.image : "";
    const mimeType =
      typeof body?.mimeType === "string" && body.mimeType.startsWith("image/")
        ? body.mimeType
        : "image/jpeg";

    if (!image) return json({ error: "Missing 'image'" }, 400);
    if (image.length > 4_000_000) return json({ error: "Image too large" }, 413);

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
      return json({ status: "unavailable", name: "", reason: "not_configured" }, 200);
    }

    const { data: requestCount, error: rateLimitError } = await supabase.rpc(
      "consume_gemma_rate_limit",
      { target_user_id: userData.user.id }
    );
    if (rateLimitError || typeof requestCount !== "number") {
      console.error("medicine-photo rate limit unavailable");
      return json({ error: "Rate limiting is unavailable" }, 503);
    }
    if (requestCount > 30) return json({ error: "Rate limit exceeded" }, 429);

    const primaryModel = Deno.env.get("MEDICINE_PHOTO_MODEL") ?? "gemini-3.5-flash-lite";
    const fallbackModel = Deno.env.get("MEDICINE_PHOTO_FALLBACK_MODEL") ?? "gemma-4-26b-a4b-it";

    let name = "";
    for (const model of [primaryModel, fallbackModel]) {
      name = await readName(model, key, image, mimeType);
      if (name) break;
    }

    if (!name || /UNREADABLE/i.test(name)) {
      return json({ status: "unavailable", name: "", reason: "unreadable" }, 200);
    }

    return json({ status: "available", name }, 200);
  } catch (err) {
    console.error("medicine-photo request failed", err);
    return json({ status: "unavailable", name: "", reason: "internal_error" }, 200);
  }
});

async function readName(model: string, key: string, image: string, mimeType: string): Promise<string> {
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
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT }, { inlineData: { mimeType, data: image } }],
          },
        ],
        generationConfig: { temperature: 0, maxOutputTokens: 500 },
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!upstream.ok) {
      console.error("medicine-photo upstream status", model, upstream.status);
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
    console.error("medicine-photo model call failed", model, err);
    return "";
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
