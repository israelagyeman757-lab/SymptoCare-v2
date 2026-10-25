import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Stethoscope, Pill, CalendarDays, UserRound, Siren, HeartPulse } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { useAuth } from '@/lib/auth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/lib/utils';

const mobileNav = [
  { to: '/dashboard', labelKey: 'nav.home' as const, icon: Home },
  { to: '/symptoms', labelKey: 'nav.symptoms' as const, icon: Stethoscope },
  { to: '/medicines', labelKey: 'nav.medicines' as const, icon: Pill },
  { to: '/appointments', labelKey: 'nav.appointments' as const, icon: CalendarDays },
  { to: '/profile', labelKey: 'nav.profile' as const, icon: UserRound },
  { to: '/emergency', labelKey: 'nav.emergency' as const, icon: Siren },
];

const desktopNav = [
  { to: '/dashboard', labelKey: 'nav.home' as const },
  { to: '/symptoms', labelKey: 'nav.symptoms' as const },
  { to: '/medicines', labelKey: 'nav.medicines' as const },
  { to: '/appointments', labelKey: 'nav.appointments' as const },
  { to: '/education', labelKey: 'nav.education' as const },
  { to: '/first-aid', labelKey: 'nav.firstaid' as const },
  { to: '/profile', labelKey: 'nav.profile' as const },
  { to: '/emergency', labelKey: 'nav.emergency' as const },
];

export function AppShell() {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        {t('nav.main')}
      </a>

      <header
        className={cn(
          'sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur transition-shadow duration-200',
          !atTop && 'shadow-md'
        )}
      >
        <div className="container flex h-16 items-center gap-3">
          <Link to={user ? '/dashboard' : '/'} className="flex min-h-11 items-center gap-2 text-primary" aria-label="SymptoCare">
            <HeartPulse className="h-7 w-7 text-primary" aria-hidden="true" />
            <span className="font-heading text-lg font-bold tracking-tight">SymptoCare</span>
          </Link>

          <nav aria-label={t('nav.main')} className="ml-4 hidden items-center gap-1 lg:flex">
            {desktopNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'min-h-11 cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-150',
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 pb-24 md:pb-10">
        <Outlet />
      </main>

      <nav
        aria-label={t('nav.main')}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-6 px-2 py-1">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition-colors duration-150',
                      isActive
                        ? 'bg-secondary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} aria-hidden="true" />
                      <span>{t(item.labelKey)}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
