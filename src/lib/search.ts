import { supabase, supabaseConfigured } from '@/integrations/supabase/client';

export interface WebSearchResult {
  title: string;
  url: string;
  description: string;
}

export interface SearchOutcome {
  status: 'available' | 'unavailable';
  results: WebSearchResult[];
}

const UNAVAILABLE: SearchOutcome = { status: 'unavailable', results: [] };

export async function searchWeb(query: string): Promise<SearchOutcome> {
  if (!supabaseConfigured || !supabase) return UNAVAILABLE;

  try {
    const { data, error } = await supabase.functions.invoke('search-content', {
      body: { query: query.trim() },
    });

    if (error || !data) return UNAVAILABLE;

    const outcome = data as Partial<SearchOutcome> | null;
    if (outcome?.status === 'available' && Array.isArray(outcome.results)) {
      return {
        status: 'available',
        results: outcome.results
          .filter(
            (r): r is WebSearchResult =>
              typeof r?.title === 'string' &&
              typeof r?.url === 'string' &&
              typeof r?.description === 'string'
          )
          .slice(0, 5),
      };
    }
    return UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
}
