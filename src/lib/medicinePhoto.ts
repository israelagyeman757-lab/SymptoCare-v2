import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

export interface PhotoResult {
  status: 'available' | 'unavailable';
  name: string;
}

const UNAVAILABLE: PhotoResult = { status: 'unavailable', name: '' };

/**
 * Reads a medicine name from a photo via the `medicine-photo` Supabase Edge
 * Function (server-side Google vision model). The key never reaches the
 * browser. Failures return an honest "unavailable" result.
 */
export async function identifyMedicineFromPhoto(imageBase64: string, mimeType = 'image/jpeg'): Promise<PhotoResult> {
  if (!supabaseConfigured || !supabase) return UNAVAILABLE;

  try {
    const { data, error } = await supabase.functions.invoke('medicine-photo', {
      body: { image: imageBase64, mimeType },
    });

    if (error || !data) return UNAVAILABLE;

    const result = data as Partial<PhotoResult> | null;
    if (result?.status === 'available' && typeof result.name === 'string' && result.name.trim()) {
      return { status: 'available', name: result.name.trim() };
    }
    return UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
}
