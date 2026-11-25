'use client';

// Registers the shared i18next instance via `initReactI18next`.
// This provider sits in the root layout, so global client components
// (e.g. CookieConsent) render outside `[lang]/layout`'s I18nProvider.
// Without this import they call `useTranslation` with no instance and log
// "react-i18next:: useTranslation: You will need to pass in an i18next
// instance by using initReactI18next".
import '@/i18n';

import CookieConsent from '@/components/privacy/CookieConsent';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import WebVitals from '@/components/analytics/WebVitals';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalytics />
      <WebVitals />
      {children}
      <CookieConsent />
    </>
  );
}
