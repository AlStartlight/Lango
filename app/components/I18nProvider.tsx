"use client";

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useEffect, useLayoutEffect } from 'react';

// Set the language before the browser paints on the client, so /jp and /id do
// not flash English. The server falls back to useEffect (no-op warning free).
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function I18nProvider({ 
  children, 
  locale = 'en' 
}: { 
  children: React.ReactNode; 
  locale?: string;
}) {
  useIsomorphicLayoutEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
