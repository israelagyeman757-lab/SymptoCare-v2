import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Languages, Loader2, RotateCcw } from 'lucide-react';
import { translateToTwi } from '@/lib/translate';
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

/**
 * Visible "Translate to Twi" control with honest loading, error, retry and
 * return-to-English states. The original English text is never overwritten.
 */
export function TranslateSection({ content, className }: TranslateSectionProps) {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [translated, setTranslated] = useState('');
  const [shownLanguage, setShownLanguage] = useState<'en' | 'tw'>('en');

  const runTranslation = async () => {
    setPhase('loading');
    const result = await translateToTwi(content);
    if (result.status === 'available' && result.translatedText) {
      setTranslated(result.translatedText);
      setShownLanguage('tw');
      setPhase('translated');
    } else {
      setPhase('error');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {phase === 'translated' && shownLanguage === 'tw' ? (
        <div className="rounded-lg border border-secondary/50 bg-secondary/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary-foreground/70">
            {t('medicines.translationLabel')}
          </p>
          <p lang="tw" className="mt-1 leading-relaxed">
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
        ) : phase === 'translated' && shownLanguage === 'tw' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShownLanguage('en')}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('medicines.showEnglish')}
          </Button>
        ) : (
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
                {t('medicines.translateToTwi')}
              </>
            )}
          </Button>
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
