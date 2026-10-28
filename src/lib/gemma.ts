import { supabase, supabaseConfigured } from '@/integrations/supabase/client';
import type { AppLanguage } from '@/i18n/translations';

export interface GemmaResult {
  status: 'available' | 'unavailable';
  answer: string;
}

const UNAVAILABLE: GemmaResult = { status: 'unavailable', answer: '' };

const RETRY_DELAY_MS = 700;

function isRetryable(error: unknown): boolean {
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  return status === undefined || status >= 500;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Educational health Q&A via the `gemma-chat` Supabase Edge Function. The
 * Google API key lives server-side in the function secret; the browser never
 * holds it. Failures return an honest "unavailable" result and the UI shows
 * a fallback message.
 */
export async function askGemma(prompt: string, language: AppLanguage): Promise<GemmaResult> {
  if (!supabaseConfigured || !supabase) return UNAVAILABLE;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await supabase.functions.invoke('gemma-chat', {
        body: { prompt, language },
      });

      if (error) {
        if (attempt === 0 && isRetryable(error)) {
          await wait(RETRY_DELAY_MS);
          continue;
        }
        return UNAVAILABLE;
      }
      if (!data) return UNAVAILABLE;

      const result = data as Partial<GemmaResult> | null;
      if (result?.status === 'available' && typeof result.answer === 'string' && result.answer.trim()) {
        return { status: 'available', answer: result.answer.trim() };
      }
      return UNAVAILABLE;
    } catch (error) {
      if (attempt === 0) {
        await wait(RETRY_DELAY_MS);
        continue;
      }
      return UNAVAILABLE;
    }
  }

  return UNAVAILABLE;
}
