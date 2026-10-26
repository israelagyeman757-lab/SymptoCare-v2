import { ExternalLink } from 'lucide-react';
import type { WebSearchResult } from '@/lib/search';
import { useI18n } from '@/i18n/useI18n';

export function WebResultsList({ results }: { results: WebSearchResult[] }) {
  const { t } = useI18n();
  if (results.length === 0) return null;

  return (
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
  );
}
