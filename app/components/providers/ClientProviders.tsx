'use client';

import CookieConsent from '@/components/privacy/CookieConsent';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
}
