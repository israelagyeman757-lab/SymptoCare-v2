import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

export interface TranslationResult {
  sourceLanguage: 'en';
  targetLanguage: 'tw';
  translatedText: string;
  status: 'available' | 'unavailable';
  reviewed: boolean;
}

const UNAVAILABLE: TranslationResult = {
  sourceLanguage: 'en',
  targetLanguage: 'tw',
  translatedText: '',
  status: 'unavailable',
  reviewed: false,
};

/**
 * Optional English-to-Twi translation. The GhanaNLP subscription key lives
 * server-side in the `translate-content` Supabase Edge Function; the browser
 * never holds it. Failures return an honest "unavailable" result and the UI
 * keeps the original English text.
 */
export async function translateToTwi(text: string): Promise<TranslationResult> {
  if (!supabaseConfigured || !supabase) return UNAVAILABLE;

  try {
    const { data, error } = await supabase.functions.invoke('translate-content', {
      body: { text, target_lang: 'tw' },
    });

    if (error || !data) return UNAVAILABLE;

    const result = data as Partial<TranslationResult> | null;
    if (
      result?.status === 'available' &&
      typeof result.translatedText === 'string' &&
      result.translatedText.trim()
    ) {
      return {
        sourceLanguage: 'en',
        targetLanguage: 'tw',
        translatedText: result.translatedText.trim(),
        status: 'available',
        reviewed: false,
      };
    }
    return UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
}
