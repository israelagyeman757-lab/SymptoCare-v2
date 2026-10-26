import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  SYMPTOMS,
  redFlagsForSymptoms,
  evaluateTriage,
  pickText,
  type TriageResult,
} from '@/lib/triage';
import { useI18n } from '@/i18n/useI18n';
import { SymptomChat } from '@/components/shared/SymptomChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface NavigationState {
  result: TriageResult;
  selectedSymptoms: string[];
}

export default function Symptoms() {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [durationDays, setDurationDays] = useState<string | null>(null);
  const [childUnderFive, setChildUnderFive] = useState<boolean | null>(null);

  const relevantFlags = useMemo(() => redFlagsForSymptoms(selectedIds), [selectedIds]);

  const needsDuration = selectedIds.some((id) => ['fever', 'cough', 'diarrhoea', 'vomiting'].includes(id));
  const needsChildQuestion = selectedIds.some((id) => ['fever', 'vomiting', 'diarrhoea'].includes(id));

  const hasFlagStep = relevantFlags.length > 0;
  const hasExtraStep = needsDuration || needsChildQuestion;
  const totalSteps = 1 + (hasFlagStep ? 1 : 0) + (hasExtraStep ? 1 : 0) + 1;

  const filteredSymptoms = SYMPTOMS.filter((s) =>
    pickText(s.label, language).toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.label.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSymptom = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setAnswers({});
    setDurationDays(null);
    setChildUnderFive(null);
  };

  const canProceed = (() => {
    if (step === 0) return selectedIds.length > 0;
    if (step === 1 && hasFlagStep) {
      return relevantFlags.every((rf) => answers[rf.id] !== undefined);
    }
    if (step === 1 && !hasFlagStep && hasExtraStep) {
      return (!needsDuration || durationDays !== null) && (!needsChildQuestion || childUnderFive !== null);
    }
    if (step === 2 && hasFlagStep && hasExtraStep) {
      return (!needsDuration || durationDays !== null) && (!needsChildQuestion || childUnderFive !== null);
    }
    return true;
  })();

  const currentStepLabel = () => {
    let index = step;
    const isFlagStep = hasFlagStep && step === 1;
    const isExtraStep = (hasFlagStep && step === 2 && hasExtraStep) || (!hasFlagStep && step === 1 && hasExtraStep);
    if (isFlagStep) index = 1;
    if (isExtraStep) index = 2;
    return t('symptoms.stepOf', { current: index + 1, total: totalSteps });
  };

  const submit = () => {
    const result = evaluateTriage({
      symptomIds: selectedIds,
      redFlagAnswers: answers,
      durationDays,
      childUnderFive,
    });
    const state: NavigationState = { result, selectedSymptoms: selectedIds };
    navigate('/symptoms/results', { state });
  };

  const durationOptions = [
    { id: 'lt1', en: 'Less than 1 day', tw: 'Nna 1 ntwa mu' },
    { id: '1to3', en: '1 to 3 days', tw: 'Nna 1 kosi 3' },
    { id: 'gt3', en: 'More than 3 days', tw: 'Nna 3 akyi' },
  ];

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('symptoms.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('symptoms.subtitle')}</p>

      <SymptomChat />

      <div className="mt-10 border-t pt-8">
        <h2 className="text-lg font-bold">{t('symptomChat.optionsTitle')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('symptomChat.optionsHint')}</p>
      </div>

      <p className="mt-4 text-sm font-semibold text-muted-foreground">{currentStepLabel()}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={Math.min(step + 1, totalSteps)}>
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(Math.min(step + 1, totalSteps) / totalSteps) * 100}%` }}
        />
      </div>

      {step === 0 && (
        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-bold">{t('symptoms.whatFeeling')}</h2>
          <p className="text-sm text-muted-foreground">{t('symptoms.selectAll')}</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              aria-label={t('symptoms.searchSymptoms')}
              placeholder={t('symptoms.searchSymptoms')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredSymptoms.map((s) => {
              const selected = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSymptom(s.id)}
                  aria-pressed={selected}
                  className={cn(
                    'flex min-h-12 cursor-pointer items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors duration-150',
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-card hover:bg-muted'
                  )}
                >
                  <span>{pickText(s.label, language)}</span>
                  {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step === 1 && hasFlagStep && (
        <section className="mt-6 space-y-6">
          <h2 className="text-lg font-bold">{t('symptoms.redFlagQuestions')}</h2>
          <p className="text-sm text-muted-foreground">{t('symptoms.yesNoHint')}</p>
          {relevantFlags.map((rf) => (
            <fieldset key={rf.id}>
              <legend className="font-semibold">{pickText(rf.question, language)}</legend>
              <div className="mt-2 flex gap-2">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [rf.id]: value }))}
                    aria-pressed={answers[rf.id] === value}
                    className={cn(
                      'min-h-11 min-w-20 cursor-pointer rounded-md border px-5 py-2 text-sm font-bold transition-colors duration-150',
                      answers[rf.id] === value
                        ? value
                          ? 'border-emergency bg-emergency text-emergency-foreground'
                          : 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-card hover:bg-muted'
                    )}
                  >
                    {value ? t('common.yes') : t('common.no')}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </section>
      )}

      {((step === 1 && !hasFlagStep && hasExtraStep) || (step === 2 && hasFlagStep && hasExtraStep)) && (
        <section className="mt-6 space-y-6">
          {needsDuration && (
            <fieldset>
              <legend className="font-semibold">{t('symptoms.durationTitle')}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDurationDays(opt.id)}
                    aria-pressed={durationDays === opt.id}
                    className={cn(
                      'min-h-12 cursor-pointer rounded-md border px-4 py-2 text-sm font-semibold transition-colors duration-150',
                      durationDays === opt.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-card hover:bg-muted'
                    )}
                  >
                    {opt[language]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {needsChildQuestion && (
            <fieldset>
              <legend className="font-semibold">{t('symptoms.childQuestion')}</legend>
              <div className="mt-2 flex gap-2">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setChildUnderFive(value)}
                    aria-pressed={childUnderFive === value}
                    className={cn(
                      'min-h-11 min-w-20 cursor-pointer rounded-md border px-5 py-2 text-sm font-bold transition-colors duration-150',
                      childUnderFive === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-card hover:bg-muted'
                    )}
                  >
                    {value ? t('common.yes') : t('common.no')}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </section>
      )}

      {step === totalSteps - 1 && (
        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-bold">{t('symptoms.reviewTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('symptoms.reviewHint')}</p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('symptoms.answers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {SYMPTOMS.filter((s) => selectedIds.includes(s.id)).map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                    {pickText(s.label, language)}
                  </li>
                ))}
                {relevantFlags
                  .filter((rf) => answers[rf.id] !== undefined)
                  .map((rf) => (
                    <li key={rf.id} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>
                        {pickText(rf.question, language)} — <strong>{answers[rf.id] ? t('common.yes') : t('common.no')}</strong>
                      </span>
                    </li>
                  ))}
                {needsDuration && durationDays && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                    {t('symptoms.durationTitle')} — <strong>{durationOptions.find((o) => o.id === durationDays)?.[language]}</strong>
                  </li>
                )}
                {needsChildQuestion && childUnderFive !== null && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                    {t('symptoms.childQuestion')} — <strong>{childUnderFive ? t('common.yes') : t('common.no')}</strong>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
          <Alert>{t('symptoms.disclaimer')}</Alert>
        </section>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {t('common.previous')}
        </Button>

        {step < totalSteps - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>
            {t('common.next')}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" variant="accent" onClick={submit}>
            {t('symptoms.getGuidance')}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
