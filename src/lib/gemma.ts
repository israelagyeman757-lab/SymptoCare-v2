import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

export interface GemmaResult {
  status: 'available' | 'unavailable';
  answer: string;
}

const UNAVAILABLE: GemmaResult = { status: 'unavailable', answer: '' };

/**
 * Educational health Q&A via the `gemma-chat` Supabase Edge Function. The
 * Google API key lives server-side in the function secret; the browser never
 * holds it. Failures return an honest "unavailable" result and the UI shows
 * a fallback message.
 */
export async function askGemma(prompt: string): Promise<GemmaResult> {
  if (!supabaseConfigured || !supabase) return UNAVAILABLE;

  try {
    const { data, error } = await supabase.functions.invoke('gemma-chat', {
      body: { prompt },
    });

    if (error || !data) return UNAVAILABLE;

    const result = data as Partial<GemmaResult> | null;
    if (result?.status === 'available' && typeof result.answer === 'string' && result.answer.trim()) {
      return { status: 'available', answer: result.answer.trim() };
    }
    return UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
}
