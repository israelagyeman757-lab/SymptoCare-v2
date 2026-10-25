import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16 text-center">
      <Compass className="h-12 w-12 text-primary" aria-hidden="true" />
      <h1 className="mt-4 text-3xl font-bold">{t('notfound.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('notfound.message')}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        {t('notfound.home')}
      </Link>
    </div>
  );
}
