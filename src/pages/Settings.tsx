import { ShieldCheck, Info } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  const { t } = useI18n();

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t('settings.title')}</h1>

      <Card className="mt-6">
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
