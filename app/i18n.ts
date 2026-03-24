import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import id from './locales/id.json';
import jp from './locales/jp.json';
import hi from './locales/hi.json';
import de from './locales/de.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import ko from './locales/ko.json';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      id: { translation: id },
      jp: { translation: jp },
      hi: { translation: hi },
      de: { translation: de },
      ar: { translation: ar },
      fr: { translation: fr },
      pt: { translation: pt },
      it: { translation: it },
      nl: { translation: nl },
      ko: { translation: ko },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
