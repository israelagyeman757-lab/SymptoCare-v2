import { supabase, supabaseConfigured } from '@/integrations/supabase/client';
import type { AppLanguage } from '@/i18n/translations';

export type SymptomUrgency = 'emergency' | 'urgent' | 'routine' | 'self_care';

export interface SymptomChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SymptomChatReply {
  status: 'available' | 'unavailable';
  reply: string;
  urgency: SymptomUrgency | 'undetermined';
  done: boolean;
}

const UNAVAILABLE: SymptomChatReply = {
  status: 'unavailable',
  reply: '',
  urgency: 'undetermined',
  done: false,
};

const URGENCIES: SymptomUrgency[] = ['emergency', 'urgent', 'routine', 'self_care'];

const RETRY_DELAY_MS = 700;

function isRetryable(error: unknown): boolean {
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  return status === undefined || status >= 500;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Conversational symptom guidance via the `symptom-chat` Edge Function. The
 * model asks a few follow-up questions, then reports one of the app's existing
 * urgency levels. It never sees the Google key and never returns a diagnosis.
 */
export async function askSymptomAssistant(
  messages: SymptomChatMessage[],
  language: AppLanguage
): Promise<SymptomChatReply> {
  if (!supabaseConfigured || !supabase) return UNAVAILABLE;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await supabase.functions.invoke('symptom-chat', {
        body: { messages, language },
      });

      if (error) {
        if (attempt === 0 && isRetryable(error)) {
          await wait(RETRY_DELAY_MS);
          continue;
        }
        return UNAVAILABLE;
      }
      if (!data) return UNAVAILABLE;

      const result = data as Partial<SymptomChatReply> | null;
      if (result?.status !== 'available' || typeof result.reply !== 'string' || !result.reply.trim()) {
        return UNAVAILABLE;
      }

      const urgency = URGENCIES.find((value) => value === result.urgency) ?? 'undetermined';

      return {
        status: 'available',
        reply: result.reply.trim(),
        urgency,
        done: result.done === true,
      };
    } catch {
      if (attempt === 0) {
        await wait(RETRY_DELAY_MS);
        continue;
      }
      return UNAVAILABLE;
    }
  }

  return UNAVAILABLE;
}
