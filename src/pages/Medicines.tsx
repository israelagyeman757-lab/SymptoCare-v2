import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, Pill, Loader2, Camera, Globe, ChevronRight } from 'lucide-react';
import { searchMedicines, suggestExamples, type SearchResult } from '@/lib/medicines';
import { useI18n } from '@/i18n/useI18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export default function Medicines() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    // Local search is fast; a short delay keeps the loading state perceivable
    window.setTimeout(() => {
      setResult(searchMedicines(query));
      setBusy(false);
    }, 300);
  };

  const runExample = (example: string) => {
    setQuery(example);
    setResult(searchMedicines(example));
  };

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('medicines.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('medicines.subtitle')}</p>

      <form onSubmit={submit} className="mt-6 flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label={t('medicines.searchPlaceholder')}
            placeholder={t('medicines.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={busy || !query.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
          <span className="hidden sm:inline">{t('medicines.searchAction')}</span>
          <span className="sr-only sm:hidden">{t('medicines.searchAction')}</span>
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t('medicines.tryExamples')}</span>
        {suggestExamples().map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => runExample(example)}
            className="min-h-11 cursor-pointer rounded-full border bg-card px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-muted"
          >
            {example}
          </button>
        ))}
      </div>

      <section aria-live="polite" className="mt-6 space-y-3">
        {busy && (
          <Card>
            <CardContent className="flex items-center gap-3 p-5 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              {t('common.loading')}
            </CardContent>
          </Card>
        )}

        {!busy && result && result.status === 'not_found' && (
          <>
            <Alert variant="warning">
              <p className="font-bold">{t('medicines.noResults')}</p>
              <p className="mt-1">{t('medicines.noResultsHint')}</p>
            </Alert>
            <Alert>
              <p className="font-bold">{t('medicines.askPharmacist')}</p>
            </Alert>
          </>
        )}

        {!busy && result && result.results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              {t('medicines.resultsFor')} “{result.query}” — {t('medicines.resultCount', { count: result.results.length })}
            </p>
            {result.results.map((record) => (
              <Link
                key={record.nhis_code}
                to={`/medicines/${record.nhis_code}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{record.generic_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[record.dosage_form, record.strength].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={result.status === 'found' ? 'success' : 'warning'}>
                    {t(result.status === 'found' ? 'medicines.exactMatch' : 'medicines.possibleMatch')}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </>
        )}

        {!busy && !result && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 font-bold">
                  <Camera className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {t('medicines.photoSearchTitle')}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t('medicines.photoSearchUnavailable')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 font-bold">
                  <Globe className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {t('medicines.externalSearchTitle')}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t('medicines.externalSearchUnavailable')}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
