'use client';

import CookieConsent from '@/components/privacy/CookieConsent';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalytics />
      {children}
      <CookieConsent />
    </>
  );
}
