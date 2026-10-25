import { Link, Navigate } from 'react-router-dom';
import { HeartPulse, Pill, Stethoscope, Languages, ShieldCheck, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { useAuth } from '@/lib/auth';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

const features = [
  {
    key: 'landing.featureMedsTitle',
    textKey: 'landing.featureMedsText',
    icon: Pill,
  },
  {
    key: 'landing.featureSympTitle',
    textKey: 'landing.featureSympText',
    icon: Stethoscope,
  },
  {
    key: 'landing.featureFirstAidTitle',
    textKey: 'landing.featureFirstAidText',
    icon: ShieldCheck,
  },
  {
    key: 'landing.featureLangTitle',
    textKey: 'landing.featureLangText',
    icon: Languages,
  },
] as const;

export default function LandingPage() {
  const { t } = useI18n();
  const { session, loading } = useAuth();

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-3">
          <span className="flex items-center gap-2 text-primary">
            <HeartPulse className="h-7 w-7 text-primary" aria-hidden="true" />
            <span className="font-heading text-lg font-bold tracking-tight">SymptoCare</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="container py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {t('landing.heroTitle')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t('landing.heroSubtitle')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={session ? '/dashboard' : '/auth'}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
              >
                {t('landing.ctaStart')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="border-y bg-card/60">
          <div className="container py-14">
            <h2 id="features-heading" className="text-center text-2xl font-bold md:text-3xl">
              {t('landing.featuresTitle')}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map(({ key, textKey, icon: Icon }) => (
                <div key={key} className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold">{t(key)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(textKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="safety-heading" className="container py-14">
          <div className="mx-auto max-w-3xl rounded-xl border border-accent/40 bg-accent/5 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <h2 id="safety-heading" className="font-bold">
                  {t('landing.safetyTitle')}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('landing.safetyText')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            {t('app.name')} — {t('landing.footerNote')}
          </p>
          <p>{t('app.disclaimer')}</p>
        </div>
      </footer>
    </div>
  );
}
