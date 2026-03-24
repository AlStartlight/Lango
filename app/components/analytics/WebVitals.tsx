'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/utils/analytics';
import { hasConsent } from '@/utils/consent';

type MetricName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';

interface Metric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

function reportWebVitals(metric: Metric) {
  if (!hasConsent('analytics')) return;

  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  // Send to analytics
  trackEvent('web_vitals', {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_rating: metric.rating,
  });

  // Optional: Send to your own analytics endpoint
  if (process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(console.error);
  }
}

export function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    // Dynamic import for web-vitals
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportWebVitals);
      onFID(reportWebVitals);
      onFCP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
      onINP(reportWebVitals);
    }).catch(() => {
      // web-vitals not available in development
      console.log('Web Vitals monitoring not available');
    });
  }, [pathname]);

  return null;
}

export default WebVitals;
