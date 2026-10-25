import { useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations, type AppLanguage, type TranslationKey } from './translations';

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}

export function translate(lang: AppLanguage, key: TranslationKey, vars?: Record<string, string | number>): string {
  return interpolate(translations[lang][key], vars);
}

export function useI18n() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(language, key, vars),
    [language]
  );

  return { t, language, setLanguage };
}
