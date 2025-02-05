import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Main translations
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';

// Page-specific translations
import enLogin from './locales/en/pages/login.json';
import frLogin from './locales/fr/pages/login.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
        login: enLogin,
      },
      fr: {
        translation: frTranslation,
        login: frLogin,
      },
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for React
    },

    // Have a common namespace used around the full app
    defaultNS: 'translation',
    ns: ['translation', 'login'],
  });

export default i18n; 