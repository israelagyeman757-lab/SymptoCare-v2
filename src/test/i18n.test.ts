import { describe, it, expect } from 'vitest';
import { translate } from '@/i18n/useI18n';
import { translations, type TranslationKey } from '@/i18n/translations';

describe('i18n', () => {
  it('every key exists in both languages', () => {
    const enKeys = Object.keys(translations.en);
    const twKeys = Object.keys(translations.tw);
    expect(twKeys.sort()).toEqual(enKeys.sort());
  });

  it('the brand name is identical in both languages', () => {
    expect(translations.en['app.name']).toBe('SymptoCare');
    expect(translations.tw['app.name']).toBe('SymptoCare');
  });

  it('translates with variable interpolation', () => {
    expect(translate('en', 'medicines.resultCount' as TranslationKey, { count: 3 })).toBe('3 record(s) found');
  });

  it('translate falls back gracefully for missing vars', () => {
    expect(translate('en', 'medicines.resultCount' as TranslationKey)).toBe('{count} record(s) found');
  });

  it('key English and Twi values differ (except brand)', () => {
    const enKeys = Object.keys(translations.en) as TranslationKey[];
    const differing = enKeys.filter((k) => translations.en[k] !== translations.tw[k]);
    expect(differing.length).toBeGreaterThan(enKeys.length * 0.9);
  });
});
