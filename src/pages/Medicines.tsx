import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, Pill, Loader2, Camera, Globe, ChevronRight } from 'lucide-react';
import { searchMedicines, suggestExamples, type SearchResult } from '@/lib/medicines';
import { identifyMedicineFromPhoto } from '@/lib/medicinePhoto';
import { askGemma } from '@/lib/gemma';
import { searchWeb, type WebSearchResult } from '@/lib/search';
import { useI18n } from '@/i18n/useI18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { WebResultsList } from '@/components/shared/WebResultsList';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Medicines() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [notFoundName, setNotFoundName] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);

  const showNotFound = async (name: string) => {
    setNotFoundName(name);
    setAiSummary('');
    setWebResults([]);
    setAiBusy(true);

    const outcome = await searchWeb(`${name} medicine uses`);
    const results = outcome.status === 'available' ? outcome.results.slice(0, 4) : [];
    setWebResults(results);

    const context = results
      .map((r, i) => `[${i + 1}] ${r.title}: ${r.description}`.slice(0, 400))
      .join('\n');
    const prompt = context
      ? `Using only these web search results, summarise ${name} for a general audience in Ghana in 3 short sentences: what it is commonly used for and one safety point. Do not prescribe, do not give doses, and do not diagnose.\n\n${context}`
      : `What is ${name}? Give a short, general, educational answer for Ghana. Do not prescribe or diagnose.`;

    const r = await askGemma(prompt);
    setAiBusy(false);
    if (r.status === 'available') setAiSummary(r.answer);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setPhotoError(false);
    setNotFoundName(null);
    window.setTimeout(() => {
      const res = searchMedicines(query);
      setResult(res);
      setBusy(false);
      if (res.status === 'not_found') void showNotFound(query.trim());
    }, 300);
  };

  const runExample = (example: string) => {
    setQuery(example);
    setNotFoundName(null);
    setResult(searchMedicines(example));
  };

  const onPhotoSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError(false);
    setNotFoundName(null);
    setResult(null);
    try {
      const dataUrl = await readAsDataUrl(file);
      const base64 = dataUrl.split(',')[1] ?? '';
      const photo = await identifyMedicineFromPhoto(base64, file.type || 'image/jpeg');
      if (photo.status === 'available' && photo.name) {
        const res = searchMedicines(photo.name);
        setResult(res);
        if (res.status === 'not_found') void showNotFound(photo.name);
      } else {
        setPhotoError(true);
      }
    } catch {
      setPhotoError(true);
    } finally {
      setPhotoBusy(false);
    }
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
        {(busy || photoBusy) && (
          <Card>
            <CardContent className="flex items-center gap-3 p-5 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              {photoBusy ? t('medicines.photoIdentifying') : t('common.loading')}
            </CardContent>
          </Card>
        )}

        {!busy && !photoBusy && photoError && (
          <Alert variant="warning">
            <p>{t('medicines.photoUnreadable')}</p>
          </Alert>
        )}

        {!busy && !photoBusy && result && result.status === 'not_found' && notFoundName && (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{notFoundName}</h2>
                <Badge variant="warning">{t('medicines.notInList')}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-clay">{t('medicines.aiSummary')}</p>
                {aiBusy ? (
                  <p className="mt-1 text-sm text-muted-foreground">{t('medicines.searchingSources')}</p>
                ) : aiSummary ? (
                  <p className="mt-1 text-sm leading-relaxed">{aiSummary}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">{t('gemma.unavailable')}</p>
                )}
              </div>
              <WebResultsList results={webResults} />
              <p className="text-xs text-muted-foreground">{t('medicines.askPharmacist')}</p>
            </CardContent>
          </Card>
        )}

        {!busy && !photoBusy && result && result.results.length > 0 && (
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

        {!busy && !photoBusy && !result && !notFoundName && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 font-bold">
                  <Camera className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {t('medicines.photoSearchTitle')}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  {t('medicines.photoSearchAction')}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={onPhotoSelected}
                />
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
