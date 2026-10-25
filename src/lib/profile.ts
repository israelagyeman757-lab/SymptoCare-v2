import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

/**
 * Best-effort persistence of profile fields into the `profiles` table.
 * The row is created automatically on sign-up by a database trigger.
 */
export async function updateProfile(fields: {
  displayName?: string;
  preferredLanguage?: 'en' | 'tw';
}): Promise<{ ok: boolean }> {
  if (!supabaseConfigured || !supabase) return { ok: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const patch: Record<string, unknown> = {};
  if (fields.displayName !== undefined) patch.display_name = fields.displayName.trim() || null;
  if (fields.preferredLanguage !== undefined) patch.preferred_language = fields.preferredLanguage;

  const { error } = await supabase.from('profiles').upsert({ id: user.id, ...patch });
  return { ok: !error };
}
