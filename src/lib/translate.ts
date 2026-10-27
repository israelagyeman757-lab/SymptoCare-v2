import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

export type TranslationTarget = 'tw' | 'ee' | 'gaa' | 'fat' | 'dag';

/** Languages the Khaya API actually translates to (Hausa and Nzema are not supported). */
export const TRANSLATION_TARGETS: readonly TranslationTarget[] = ['tw', 'ee', 'gaa', 'fat', 'dag'];

export interface TranslationResult {
  sourceLanguage: 'en';
  targetLanguage: TranslationTarget;
  translatedText: string;
  status: 'available' | 'unavailable';
  reviewed: boolean;
}

const unavailable = (target: TranslationTarget): TranslationResult => ({
  sourceLanguage: 'en',
  targetLanguage: target,
  translatedText: '',
  status: 'unavailable',
  reviewed: false,
});

/**
 * Optional English-to-Ghanaian-language translation. The GhanaNLP subscription
 * key lives server-side in the `translate-content` Supabase Edge Function; the
 * browser never holds it. Failures return an honest "unavailable" result and
 * the UI keeps the original English text.
 */
export async function translateContent(
  text: string,
  target: TranslationTarget = 'tw'
): Promise<TranslationResult> {
  if (!supabaseConfigured || !supabase) return unavailable(target);

  try {
    const { data, error } = await supabase.functions.invoke('translate-content', {
      body: { text, target_lang: target },
    });

    if (error || !data) return unavailable(target);

    const result = data as Partial<TranslationResult> | null;
    if (
      result?.status === 'available' &&
      typeof result.translatedText === 'string' &&
      result.translatedText.trim()
    ) {
      return {
        sourceLanguage: 'en',
        targetLanguage: target,
        translatedText: result.translatedText.trim(),
        status: 'available',
        reviewed: false,
      };
    }
    return unavailable(target);
  } catch {
    return unavailable(target);
  }
}
