import { PhoneCall, Siren, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';

const numbers = [
  { key: 'emergency.national', number: '112', href: 'tel:112' },
  { key: 'emergency.ambulance', number: '193', href: 'tel:193' },
  { key: 'emergency.police', number: '191', href: 'tel:191' },
  { key: 'emergency.fire', number: '192', href: 'tel:192' },
] as const;

export default function Emergency() {
  const { t } = useI18n();

  return (
    <div className="container max-w-2xl py-8">
      <div
        role="alert"
        className="flex items-start gap-4 rounded-xl border-2 border-emergency bg-emergency/10 p-5"
      >
        <Siren className="mt-0.5 h-9 w-9 shrink-0 text-emergency" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold">{t('emergency.title')}</h1>
          <p className="mt-1 font-semibold leading-relaxed">{t('emergency.subtitle')}</p>
        </div>
      </div>

      <a
        href="tel:112"
        className="mt-6 flex min-h-16 w-full items-center justify-center gap-3 rounded-xl bg-emergency px-6 text-xl font-bold text-emergency-foreground shadow-sm transition-colors hover:bg-emergency/90"
      >
        <PhoneCall className="h-6 w-6" aria-hidden="true" />
        {t('emergency.callNow')}
      </a>

      <section aria-labelledby="numbers-heading" className="mt-8">
        <h2 id="numbers-heading" className="sr-only">
          {t('emergency.title')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {numbers.map((item) => (
            <li key={item.number}>
              <a
                href={item.href}
                className="flex min-h-16 items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
              >
                <span className="font-semibold">{t(item.key)}</span>
                <span className="font-heading text-xl font-bold text-emergency">{item.number}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{t('emergency.verifyNumbers')}</p>
      </section>

      <section aria-labelledby="when-heading" className="mt-8">
        <h2 id="when-heading" className="text-lg font-bold">
          {t('emergency.whenToCallTitle')}
        </h2>
        <ul className="mt-3 space-y-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <li key={n} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emergency" aria-hidden="true" />
              {t(`emergency.whenToCall${n}` as 'emergency.whenToCall1')}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="wait-heading" className="mt-8">
        <h2 id="wait-heading" className="text-lg font-bold">
          {t('emergency.whileWaitingTitle')}
        </h2>
        <ul className="mt-3 space-y-2">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-start gap-3 text-sm leading-relaxed">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {t(`emergency.whileWaiting${n}` as 'emergency.whileWaiting1')}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
