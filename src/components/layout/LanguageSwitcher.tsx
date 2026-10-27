import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { languageNames, type AppLanguage } from '@/i18n/translations';
import { updateProfile } from '@/lib/profile';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const langs: AppLanguage[] = ['en', 'tw', 'ee', 'gaa', 'fat', 'dag'];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="App language"
        className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span>{languageNames[language]}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="App language"
          className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-md border bg-card p-1 shadow-md"
        >
          {langs.map((lang) => (
            <li key={lang} role="option" aria-selected={language === lang}>
              <button
                type="button"
                onClick={() => {
                  setLanguage(lang);
                  void updateProfile({ preferredLanguage: lang });
                  setOpen(false);
                }}
                className={cn(
                  'flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm font-semibold',
                  language === lang ? 'text-primary' : 'text-foreground hover:bg-muted'
                )}
              >
                <span>{languageNames[lang]}</span>
                {language === lang && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
