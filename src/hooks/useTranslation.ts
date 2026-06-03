import {useCallback} from 'react';
import {SUPPORTED_LANGUAGES, TranslationKey, translations} from '@constants/i18n';
import {useLanguageStore} from '@store/languageStore';

type TranslationParams = Record<string, string | number>;

export const useTranslation = () => {
  const language = useLanguageStore(state => state.language);

  const t = useCallback((key: TranslationKey, params?: TranslationParams): string => {
    const template = String(translations[language][key] ?? translations.en[key] ?? key);

    if (!params) {
      return template;
    }

    return Object.entries(params).reduce<string>(
      (result, [paramKey, value]) => result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value)),
      template,
    );
  }, [language]);

  return {t, language, languages: SUPPORTED_LANGUAGES};
};
