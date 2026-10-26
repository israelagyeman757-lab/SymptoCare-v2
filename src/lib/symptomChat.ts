import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

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

/**
 * Conversational symptom guidance via the `symptom-chat` Edge Function. The
 * model asks a few follow-up questions, then reports one of the app's existing
 * urgency levels. It never sees the Google key and never returns a diagnosis.
 */
export async function askSymptomAssistant(messages: SymptomChatMessage[]): Promise<SymptomChatReply> {
  if (!supabaseConfigured || !supabase) return UNAVAILABLE;

  try {
    const { data, error } = await supabase.functions.invoke('symptom-chat', {
      body: { messages },
    });

    if (error || !data) return UNAVAILABLE;

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
    return UNAVAILABLE;
  }
}
