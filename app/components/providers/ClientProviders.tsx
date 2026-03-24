'use client';

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
