import { useState, type FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchWeb, type WebSearchResult } from '@/lib/search';
import { useI18n } from '@/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { WebResultsList } from '@/components/shared/WebResultsList';

export function WebSearchSection({ initialQuery }: { initialQuery: string }) {
  const { t } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<WebSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [failed, setFailed] = useState(false);

  const runSearch = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setFailed(false);
    setSearched(false);
    const outcome = await searchWeb(q);
    setLoading(false);
    setSearched(true);
    if (outcome.status === 'available') setResults(outcome.results);
    else setFailed(true);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={runSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('search.label')}
          maxLength={200}
        />
        <Button type="submit" variant="outline" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
          {t('search.button')}
        </Button>
      </form>

      {searched && !failed && results.length === 0 && (
        <Alert variant="warning">{t('search.noResults')}</Alert>
      )}
      {failed && <Alert variant="warning">{t('search.unavailable')}</Alert>}

      {results.length > 0 && <WebResultsList results={results} />}
    </div>
  );
}
