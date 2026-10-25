import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall } from 'lucide-react';
import { FIRST_AID_TOPICS } from '@/data/education';
import { pickText } from '@/lib/triage';
import { useI18n } from '@/i18n/useI18n';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TranslateSection } from '@/components/shared/TranslateSection';

export default function FirstAid() {
  const { t, language } = useI18n();

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('firstaid.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('firstaid.subtitle')}</p>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-emergency/50 bg-emergency/5 p-4">
        <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-emergency" aria-hidden="true" />
        <p className="text-sm font-semibold leading-relaxed">{t('firstaid.callFirst')}</p>
      </div>

      <div className="mt-6 space-y-6">
        {FIRST_AID_TOPICS.map((topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HeartPulse className="h-5 w-5 shrink-0 text-emergency" aria-hidden="true" />
                  {pickText(topic.title, language)}
                </CardTitle>
                <Badge variant="warning">{t('common.reviewPending')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-muted-foreground">{pickText(topic.intro, language)}</p>
              <ol className="space-y-3">
                {topic.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emergency/10 text-xs font-bold text-emergency">
                      {i + 1}
                    </span>
                    {pickText(step, language)}
                  </li>
                ))}
              </ol>
              <Alert variant="warning">
                <p>{pickText(topic.warning, language)}</p>
              </Alert>
              <div className="border-t pt-4">
                <TranslateSection
                  content={[pickText(topic.title, 'en'), pickText(topic.intro, 'en'), ...topic.steps.map((s) => s.en)].join(' ')}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="mt-6">
        <p>{t('firstaid.reviewNote')}</p>
        <p className="mt-1">{t('firstaid.notCertified')}</p>
      </Alert>

      <Link
        to="/emergency"
        className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-xl bg-emergency px-6 text-lg font-bold text-emergency-foreground shadow-sm transition-colors hover:bg-emergency/90"
      >
        <PhoneCall className="h-5 w-5" aria-hidden="true" />
        {t('firstaid.callEmergency')}
      </Link>
    </div>
  );
}
