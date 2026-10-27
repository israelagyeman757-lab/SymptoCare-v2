import type { AppLanguage } from './translations';

/**
 * Package and dosage-form words from the NHIS medicine catalogue.
 * Machine-drafted and not reviewed; values without a confident local word stay
 * in English, which is how they are printed on medicine packs in Ghana.
 */
const TERMS: Record<Exclude<AppLanguage, 'en'>, Record<string, string>> = {
  tw: {
    Tablet: 'Tɛblɛt',
    Capsule: 'Kapsul',
    Suspension: 'Asɛnsyɔn',
    Cream: 'Krim',
    Syrup: 'Sirap',
    Infusion: 'Infyɔn',
    Suppository: 'Sapositori',
    'Eye Ointment': 'Ani Nkataade',
    Ointment: 'Nkataade',
    Solution: 'Solhyɔn',
    Lotion: 'Lɔhyɔn',
    'Eye Drops': 'Ani Nsu',
    'Nasal Drops': 'Hene Nsu',
    'Ear Drops': 'Aso Nsu',
    Mouthwash: 'Ano Nsu',
    'Granular Powder': 'Powda Ketewa',
    'Oral Suspension': 'Nsu Ano Asɛnsyɔn',
    'Sustained-Release Tablet': 'Tɛblɛt a Ɛtwe Berɛ',
    Powder: 'Powda',
    'Softgel Capsule': 'Kapsul Mmerɛ',
    Inhaler: 'Inhela',
    Ampoule: 'Ampul',
    Sachet: 'Sɛhyɛt',
    Bottle: 'Botase',
  },
  ee: {
    Ointment: 'Ami',
    'Eye Ointment': 'Nɔkuami',
    'Eye Drops': 'Nɔkutsetso',
    'Ear Drops': 'Toebe',
    'Nasal Drops': 'Ŋɔtitsetso',
    Powder: 'Fliti',
    'Granular Powder': 'Fliti',
    Bottle: 'Kpe',
  },
  gaa: {
    Syrup: 'Shirapu',
  },
  fat: {
    'Eye Drops': 'Eni ho nsu',
    Syrup: 'Nsuo-duru',
  },
  dag: {
    Syrup: 'Siroopi',
  },
};

export function medicineTerm(value: string | null | undefined, language: AppLanguage): string | null {
  if (!value) return null;
  if (language === 'en') return value;
  return TERMS[language][value] ?? value;
}
