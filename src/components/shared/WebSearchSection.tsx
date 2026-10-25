import { useState, type FormEvent } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import { searchWeb, type WebSearchResult } from '@/lib/search';
import { useI18n } from '@/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

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

      {results.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground">{t('search.notReviewed')}</p>
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.url} className="rounded-lg border bg-card p-3">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 font-semibold text-primary hover:underline"
                >
                  {r.title}
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
                {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
