import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Pill, CalendarDays, BookOpen, HeartPulse, Siren, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/i18n/useI18n';
import { facilityTranslationKey, listRequests, type AppointmentRequest } from '@/lib/appointments';
import { getRecentMedicine } from '@/lib/recent';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentMedicine] = useState(() => getRecentMedicine());

  useEffect(() => {
    let active = true;
    listRequests()
      .then((list) => {
        if (active) setRequests(list.filter((r) => r.status === 'requested'));
      })
      .catch(() => {
        if (active) setRequests([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const facilityLabel = (id: string) => {
    const key = facilityTranslationKey(id);
    return key ? t(key) : id;
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || '';

  const quickLinks = [
    { to: '/symptoms', label: t('dashboard.symptoms'), icon: Stethoscope },
    { to: '/medicines', label: t('dashboard.medicines'), icon: Pill },
    { to: '/appointments', label: t('dashboard.appointments'), icon: CalendarDays },
    { to: '/education', label: t('dashboard.education'), icon: BookOpen },
    { to: '/first-aid', label: t('dashboard.firstAid'), icon: HeartPulse },
  ];

  return (
    <div className="container max-w-3xl py-8">
      <p className="text-sm font-bold uppercase tracking-wide text-clay">
        {t('dashboard.greeting')}
        {displayName ? `, ${displayName}` : ''}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-primary md:text-3xl">
        {t('dashboard.howAreYou')}
      </h1>

      {(requests.length > 0 || recentMedicine) && (
        <section aria-labelledby="continue-heading" className="mt-8">
          <h2 id="continue-heading" className="text-xl font-bold">
            {t('dashboard.continueTitle')}
          </h2>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border bg-card shadow-sm">
            {requests[0] && (
              <li>
                <Link to="/appointments" className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted">
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wide text-clay">
                      {t('nav.appointments')}
                    </span>
                    <span className="block truncate font-semibold">
                      {requests[0].clinicName ?? facilityLabel(requests[0].facilityType)}
                    </span>
                    <span className="block text-sm text-muted-foreground">{requests[0].preferredDate}</span>
                  </span>
                  <Badge variant="warning">{t('appointments.status.requested')}</Badge>
                </Link>
              </li>
            )}
            {recentMedicine && (
              <li>
                <Link
                  to={`/medicines/${recentMedicine.code}`}
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wide text-clay">
                      {t('nav.medicines')}
                    </span>
                    <span className="block truncate font-semibold">{recentMedicine.name}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      <section aria-labelledby="quick-access-heading" className="mt-8">
        <h2 id="quick-access-heading" className="text-lg font-bold">
          {t('dashboard.quickAccess')}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <span className="flex-1 font-semibold">{label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="requests-heading" className="mt-8">
        <div className="flex items-center justify-between">
          <h2 id="requests-heading" className="text-lg font-bold">
            {t('dashboard.requestsStatus')}
          </h2>
          <Link
            to="/appointments"
            className="min-h-11 cursor-pointer px-1 py-2 text-sm font-semibold text-primary hover:underline"
          >
            {t('nav.appointments')}
          </Link>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-16 w-full" />
        ) : requests.length === 0 ? (
          <p className="mt-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            {t('dashboard.noRequests')}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {requests.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4 text-sm">
                <span>
                  <span className="font-semibold">{r.clinicName ?? facilityLabel(r.facilityType)}</span>
                  <span className="text-muted-foreground"> · {r.preferredDate}</span>
                </span>
                <Badge variant="warning">{t('appointments.status.requested')}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Alert variant="warning" className="mt-8">
        <p>{t('dashboard.reminder')}</p>
      </Alert>

      <Link
        to="/emergency"
        className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-xl bg-emergency px-6 text-lg font-bold text-emergency-foreground shadow-sm transition-colors hover:bg-emergency/90"
      >
        <Siren className="h-5 w-5" aria-hidden="true" />
        {t('dashboard.emergency')}
      </Link>
    </div>
  );
}
