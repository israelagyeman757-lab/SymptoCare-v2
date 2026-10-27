import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PhoneCall, AlertTriangle, Stethoscope, CalendarClock, Home, RotateCcw, Siren } from 'lucide-react';
import { pickText, SYMPTOMS, type TriageResult } from '@/lib/triage';
import { useI18n } from '@/i18n/useI18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { TranslateSection } from '@/components/shared/TranslateSection';
import { WebSearchSection } from '@/components/shared/WebSearchSection';
import { cn } from '@/lib/utils';

interface LocationState {
  result: TriageResult;
  selectedSymptoms: string[];
}

const urgencyStyles = {
  emergency: {
    box: 'border-emergency bg-emergency/10',
    icon: Siren,
    iconClass: 'text-emergency',
    badge: 'emergency' as const,
    bannerKey: 'symptoms.emergencyBanner' as const,
  },
  urgent: {
    box: 'border-warning bg-warning/10',
    icon: AlertTriangle,
    iconClass: 'text-warning',
    badge: 'warning' as const,
    bannerKey: 'symptoms.professionalBanner' as const,
  },
  routine: {
    box: 'border-primary bg-primary/10',
    icon: CalendarClock,
    iconClass: 'text-primary',
    badge: 'default' as const,
    bannerKey: 'symptoms.routineBanner' as const,
  },
  self_care_information: {
    box: 'border-success/60 bg-success/10',
    icon: Home,
    iconClass: 'text-success',
    badge: 'success' as const,
    bannerKey: 'symptoms.selfCareBanner' as const,
  },
} as const;

export default function SymptomResults() {
  const { t, language } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  if (!state?.result) return <Navigate to="/symptoms" replace />;

  const { result } = state;
  const style = urgencyStyles[result.urgency];
  const Icon = style.icon;

  const guidanceTextEn = [
    result.explanation.en,
    ...result.nextSteps.map((s) => s.en),
  ].join(' ');

  const searchQuery = [
    ...SYMPTOMS.filter((s) => state.selectedSymptoms.includes(s.id)).map((s) => s.label.en),
    'symptoms',
  ].join(' ');

  return (
    <div className="container max-w-2xl py-8">
      <div
        role={result.urgency === 'emergency' ? 'alert' : 'status'}
        className={cn('flex items-start gap-4 rounded-xl border p-5', style.box)}
      >
        <Icon className={cn('mt-0.5 h-8 w-8 shrink-0', style.iconClass)} aria-hidden="true" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold md:text-2xl">{t('results.title')}</h1>
            <Badge variant={style.badge}>{t(`results.urgency.${result.urgency}`)}</Badge>
          </div>
          <p className="mt-2 font-semibold leading-relaxed">{t(style.bannerKey)}</p>
        </div>
      </div>

      {result.urgency === 'emergency' && (
        <a
          href="tel:112"
          className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emergency px-6 text-lg font-bold text-emergency-foreground shadow-sm transition-colors hover:bg-emergency/90"
        >
          <PhoneCall className="h-5 w-5" aria-hidden="true" />
          {t('emergency.callNow')}
        </a>
      )}

      {state.selectedSymptoms.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">{t('symptoms.answers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {SYMPTOMS.filter((s) => state.selectedSymptoms.includes(s.id)).map((s) => (
                <li key={s.id}>
                  <Badge variant="secondary">{pickText(s.label, language)}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.redFlags.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-emergency" aria-hidden="true" />
              {t('results.redFlags')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.redFlags.map((rf) => (
                <li key={rf.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emergency" aria-hidden="true" />
                  {pickText(rf.matchedNote, language)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('results.nextSteps')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {pickText(step, language)}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Alert className="mt-4">
        <p className="font-bold">{t('results.why')}</p>
        <p className="mt-1">{pickText(result.explanation, language)}</p>
        <p className="mt-2 text-xs">{t('results.ruleSetVersion')}: {result.ruleSetVersion}</p>
      </Alert>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t('medicines.translationHeading')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TranslateSection content={guidanceTextEn} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t('search.title')}</CardTitle>
          <CardDescription>{t('search.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <WebSearchSection initialQuery={searchQuery} />
        </CardContent>
      </Card>

      <Alert variant="warning" className="mt-4">
        <p>{t('results.disclaimer')}</p>
        <p className="mt-1">{t('results.noConfidence')}</p>
      </Alert>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={() => navigate('/symptoms')}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t('results.startOver')}
        </Button>
        <Link
          to="/emergency"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emergency px-4 py-2 text-sm font-semibold text-emergency-foreground shadow-sm transition-colors hover:bg-emergency/90"
        >
          <Siren className="h-4 w-4" aria-hidden="true" />
          {t('nav.emergency')}
        </Link>
      </div>
    </div>
  );
}
