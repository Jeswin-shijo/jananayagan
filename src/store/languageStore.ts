import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LanguageCode} from '@constants/i18n';

const LANGUAGE_STORAGE_KEY = 'language_code';

interface LanguageState {
  language: LanguageCode;
  restoreLanguage: () => Promise<void>;
  setLanguage: (language: LanguageCode) => Promise<void>;
}

const isLanguageCode = (value: string | null): value is LanguageCode =>
  value === 'en' || value === 'ta' || value === 'ml' || value === 'hi';

export const useLanguageStore = create<LanguageState>(set => ({
  language: 'en',

  restoreLanguage: async () => {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    set({language: isLanguageCode(storedLanguage) ? storedLanguage : 'en'});
  },

  setLanguage: async language => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    set({language});
  },
}));
