import { useI18n } from '@/i18n/useI18n';
import { languageNames, type AppLanguage } from '@/i18n/translations';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();
  const langs: AppLanguage[] = ['en', 'tw'];

  return (
    <div
      role="group"
      aria-label="App language"
      className={cn('inline-flex items-center gap-0.5 rounded-full bg-secondary p-0.5', className)}
    >
      {langs.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          className={cn(
            'min-h-8 cursor-pointer rounded-full px-3 text-sm font-semibold transition-colors duration-150',
            language === lang
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {languageNames[lang].en}
        </button>
      ))}
    </div>
  );
}
