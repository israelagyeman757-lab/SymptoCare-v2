import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Languages, Loader2, RotateCcw } from 'lucide-react';
import { translateContent, TRANSLATION_TARGETS, type TranslationTarget } from '@/lib/translate';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/i18n/useI18n';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface TranslateSectionProps {
  content: string;
  className?: string;
}

type Phase = 'idle' | 'loading' | 'translated' | 'error';
type View = 'source' | 'translation';

/**
 * Visible "Translate" control with a target-language picker, honest loading,
 * error and retry states. The original English text is never overwritten.
 */
export function TranslateSection({ content, className }: TranslateSectionProps) {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [view, setView] = useState<View>('source');
  const [target, setTarget] = useState<TranslationTarget>('tw');
  const [translatedIn, setTranslatedIn] = useState<TranslationTarget>('tw');
  const [translated, setTranslated] = useState('');

  const runTranslation = async () => {
    setPhase('loading');
    const result = await translateContent(content, target);
    if (result.status === 'available' && result.translatedText) {
      setTranslated(result.translatedText);
      setTranslatedIn(target);
      setView('translation');
      setPhase('translated');
    } else {
      setPhase('error');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {phase === 'translated' && view === 'translation' ? (
        <div className="rounded-lg border border-secondary/50 bg-secondary/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary-foreground/70">
            {t('medicines.translationHeading')} · {t(`languages.${translatedIn}`)}
          </p>
          <p lang={translatedIn} className="mt-1 leading-relaxed">
            {translated}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t('medicines.translationNotReviewed')}</p>
        </div>
      ) : (
        <p lang="en">{content}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!user ? (
          !authLoading && (
            <Link to="/auth" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <Languages className="h-4 w-4" aria-hidden="true" />
              {t('medicines.signInToTranslate')}
            </Link>
          )
        ) : phase === 'translated' && view === 'translation' ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setView('source')}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('medicines.showEnglish')}
          </Button>
        ) : (
          <>
            <select
              value={target}
              onChange={(event) => setTarget(event.target.value as TranslationTarget)}
              aria-label={t('medicines.translationTargetLabel')}
              className="min-h-9 cursor-pointer rounded-md border border-input bg-card px-2 py-1 text-sm font-semibold text-primary"
            >
              {TRANSLATION_TARGETS.map((code) => (
                <option key={code} value={code}>
                  {t(`languages.${code}`)}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={runTranslation}
              disabled={phase === 'loading'}
            >
              {phase === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t('medicines.translating')}
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" aria-hidden="true" />
                  {t('medicines.translateAction')}
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {phase === 'error' && (
        <Alert variant="warning" role="status">
          {t('medicines.translationUnavailable')}
        </Alert>
      )}
    </div>
  );
}
