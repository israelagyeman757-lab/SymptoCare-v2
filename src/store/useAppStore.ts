import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppLanguage } from '@/i18n/translations';

interface AppState {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'symptocare-settings' }
  )
);
