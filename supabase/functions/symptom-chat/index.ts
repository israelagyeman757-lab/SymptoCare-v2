import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 1000;
const MAX_TOTAL_CHARS = 6000;
const MAX_ASSISTANT_TURNS = 4;
const RATE_LIMIT_PER_HOUR = 30;

const SYSTEM_INSTRUCTION =
  "You are the symptom assistant inside SymptoCare, an educational health app for Ghana. " +
  "You are not a doctor. You never diagnose, never prescribe, and never tell someone they are safe.\n\n" +
  "Process:\n" +
  "1. The user describes symptoms in their own words.\n" +
  "2. If important safety information is missing and you have asked fewer than 3 questions, ask ONE short question under 25 words.\n" +
  "3. Otherwise conclude with an urgency level.\n\n" +
  "Urgency levels:\n" +
  "- emergency: an emergency warning sign is present or cannot be ruled out.\n" +
  "- urgent: should be seen by a health worker today.\n" +
  "- routine: should see a health worker when convenient.\n" +
  "- self_care: mild symptoms that can usually be managed at home.\n\n" +
  "Emergency warning signs: chest pain or pressure that does not go away; severe trouble breathing or breathing fast at rest; " +
  "confusion, fainting, or hard to wake; seizure; sudden face or arm weakness or slurred speech; uncontrolled bleeding or blood in vomit or stool; " +
  "stiff neck with high fever; severe pain or bleeding in pregnancy; a child under 5 who is drowsy, not drinking, breathing fast, or has sunken eyes.\n\n" +
  "Rules:\n" +
  "- Be conservative. If unsure between two levels, choose the more urgent one.\n" +
  "- Never reassure someone that they are fine, and never rule out a serious cause.\n" +
  "- Do not name a likely disease as a diagnosis. You may say a sign needs checking.\n" +
  "- Do not recommend specific medicines or doses. A pharmacist or health worker decides.\n" +
  "- For emergency, tell them to call 112 or go to the nearest health facility now.\n" +
  "- For urgent, tell them to see a health worker today.\n" +
  "- Ask about age, pregnancy, and warning signs when relevant.\n" +
  "- Do not ask for names, phone numbers, or locations.\n" +
  "- Reply in English only.\n" +
  "- When concluding, write 2-4 short sentences: what you noticed, what to do next, and that this is not a diagnosis.";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING" },
    urgency: { type: "STRING", enum: ["undetermined", "emergency", "urgent", "routine", "self_care"] },
    done: { type: "BOOLEAN" },
  },
  required: ["reply", "urgency", "done"],
};

const URGENCIES = new Set(["undetermined", "emergency", "urgent", "routine", "self_care"]);

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface Assessment {
  reply: string;
  urgency: string;
  done: boolean;
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
    const messages = parseMessages(body?.messages);
    if (typeof messages === "string") return json({ error: messages }, 400);
    if (messages.length === 0) return json({ error: "Missing 'messages'" }, 400);
    if (messages[messages.length - 1].role !== "user") {
      return json({ error: "Last message must be from the user" }, 400);
    }

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
      return json({ status: "unavailable", reply: "", urgency: "undetermined", done: false, reason: "not_configured" }, 200);
    }

    const { data: requestCount, error: rateLimitError } = await supabase.rpc("consume_symptom_rate_limit", {
      target_user_id: userData.user.id,
    });
    if (rateLimitError || typeof requestCount !== "number") {
      console.error("symptom-chat rate limit unavailable");
      return json({ error: "Rate limiting is unavailable" }, 503);
    }
    if (requestCount > RATE_LIMIT_PER_HOUR) return json({ error: "Rate limit exceeded" }, 429);

    const assistantTurns = messages.filter((m) => m.role === "model").length + 1;

    const primaryModel = Deno.env.get("SYMPTOM_CHAT_MODEL") ?? "gemini-3.5-flash-lite";
    const fallbackModel = Deno.env.get("SYMPTOM_CHAT_FALLBACK_MODEL") ?? "gemma-4-26b-a4b-it";

    let assessment: Assessment | null = null;
    for (const model of [primaryModel, fallbackModel]) {
      assessment = await callModel(model, messages, key);
      if (assessment) break;
    }

    if (!assessment) {
      return json({ status: "unavailable", reply: "", urgency: "undetermined", done: false, reason: "model_unavailable" }, 200);
    }

    if (!assessment.done && assistantTurns >= MAX_ASSISTANT_TURNS) {
      return json({ status: "unavailable", reply: "", urgency: "undetermined", done: false, reason: "max_questions" }, 200);
    }

    if (assessment.done && assessment.urgency === "undetermined") {
      return json({ status: "unavailable", reply: "", urgency: "undetermined", done: false, reason: "inconclusive" }, 200);
    }

    return json(
      {
        status: "available",
        reply: assessment.reply,
        urgency: assessment.done ? assessment.urgency : "undetermined",
        done: assessment.done,
      },
      200
    );
  } catch (err) {
    console.error("symptom-chat request failed", err);
    return json({ status: "unavailable", reply: "", urgency: "undetermined", done: false, reason: "internal_error" }, 200);
  }
});

function parseMessages(input: unknown): ChatMessage[] | string {
  if (!Array.isArray(input)) return "Missing 'messages'";
  if (input.length > MAX_MESSAGES) return "Too many messages";

  const messages: ChatMessage[] = [];
  let total = 0;

  for (const item of input) {
    const role = (item as { role?: unknown })?.role;
    const text = (item as { text?: unknown })?.text;
    if (role !== "user" && role !== "model") return "Invalid message role";
    if (typeof text !== "string") return "Invalid message text";

    const trimmed = text.trim();
    if (!trimmed) return "Empty message";
    if (trimmed.length > MAX_MESSAGE_CHARS) return "Message too long";

    total += trimmed.length;
    if (total > MAX_TOTAL_CHARS) return "Conversation too long";

    messages.push({ role, text: trimmed });
  }

  return messages;
}

async function callModel(model: string, messages: ChatMessage[], key: string): Promise<Assessment | null> {
  try {
    const endpoint =
      Deno.env.get("SYMPTOM_CHAT_API_URL") ??
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!upstream.ok) {
      console.error("symptom-chat upstream status", model, upstream.status, (await upstream.text()).slice(0, 200));
      return null;
    }

    const raw = (await upstream.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: unknown; thought?: unknown }> } }>;
    } | null;

    const text = (raw?.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim();

    const parsed = JSON.parse(text) as Partial<Assessment>;
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    const urgency = typeof parsed.urgency === "string" && URGENCIES.has(parsed.urgency) ? parsed.urgency : "";
    const done = parsed.done === true;

    if (!reply || !urgency) return null;
    return { reply, urgency, done };
  } catch (err) {
    console.error("symptom-chat model call failed", model, err);
    return null;
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
