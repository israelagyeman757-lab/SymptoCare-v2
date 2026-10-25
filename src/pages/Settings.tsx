import { ShieldCheck, Info, Globe } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { languageNames, type AppLanguage } from '@/i18n/translations';
import { updateProfile } from '@/lib/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { t, language, setLanguage } = useI18n();
  const langs: AppLanguage[] = ['en', 'tw'];

  const chooseLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    void updateProfile({ preferredLanguage: lang });
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('settings.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('settings.subtitle')}</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label={t('settings.language')} className="grid gap-2 sm:grid-cols-2">
            {langs.map((lang) => (
              <button
                key={lang}
                type="button"
                role="radio"
                aria-checked={language === lang}
                onClick={() => chooseLanguage(lang)}
                className={cn(
                  'flex min-h-14 cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-left font-semibold transition-colors duration-150',
                  language === lang
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-card hover:bg-muted'
                )}
              >
                <span>
                  {languageNames[lang].en}
                  <span className="block text-xs font-normal text-muted-foreground">{languageNames[lang].tw}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-5 w-5 rounded-full border-2',
                    language === lang ? 'border-primary bg-primary' : 'border-input'
                  )}
                />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t('settings.languageHint')}</p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
            {t('settings.privacy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('settings.privacyText')}</p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t('settings.about')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('settings.aboutText')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
