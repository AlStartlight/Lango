'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { isAnalyticsAllowed, initGoogleAnalytics } from '@/utils/analytics';
import { hasConsent } from '@/utils/consent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export default function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Check initial consent
    if (isAnalyticsAllowed()) {
      setShouldLoad(true);
      initGoogleAnalytics();
    }

    // Listen for consent changes
    const handleConsentUpdate = () => {
      if (isAnalyticsAllowed()) {
        setShouldLoad(true);
        initGoogleAnalytics();
      } else {
        setShouldLoad(false);
      }
    };

    window.addEventListener('cookie-consent-updated', handleConsentUpdate);
    return () => {
      window.removeEventListener('cookie-consent-updated', handleConsentUpdate);
    };
  }, []);

  if (!shouldLoad || !GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={() => {
          initGoogleAnalytics();
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_expires: 0,
            });
          `,
        }}
      />
    </>
  );
}
