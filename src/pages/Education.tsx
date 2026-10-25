import { BookOpen, ExternalLink } from 'lucide-react';
import { EDUCATION_TOPICS } from '@/data/education';
import { pickText } from '@/lib/triage';
import { useI18n } from '@/i18n/useI18n';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TranslateSection } from '@/components/shared/TranslateSection';

export default function Education() {
  const { t, language } = useI18n();

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('education.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('education.subtitle')}</p>

      <Alert className="mt-4">
        <p>{t('education.disclaimer')}</p>
      </Alert>

      <div className="mt-6 space-y-6">
        {EDUCATION_TOPICS.map((topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {pickText(topic.title, language)}
                </CardTitle>
                <Badge variant="warning">{t('common.reviewPending')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-muted-foreground">{pickText(topic.summary, language)}</p>
              <ul className="space-y-2">
                {topic.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {pickText(point, language)}
                  </li>
                ))}
              </ul>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {t('common.sources')}: {topic.sourceName}
                <a
                  href={topic.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">{topic.sourceName}</span>
                </a>
              </p>
              <div className="border-t pt-4">
                <TranslateSection
                  content={[pickText(topic.title, 'en'), pickText(topic.summary, 'en'), ...topic.points.map((p) => p.en)].join(' ')}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
