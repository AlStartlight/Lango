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

/**
 * Resolve the optional analytics endpoint.
 *
 * Returns null when the variable is unset, malformed, or still holds the
 * placeholder shipped in `.env.example`. Without this guard a placeholder
 * host such as `https://your-analytics-endpoint.com` makes every metric
 * beacon fail with `TypeError: Failed to fetch`.
 */
function getVitalsEndpoint(): string | null {
  const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT?.trim();
  if (!endpoint) return null;

  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.hostname === 'your-analytics-endpoint.com' || url.hostname.endsWith('.example')) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
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

  // Optional: Send to your own analytics endpoint.
  // Telemetry must never surface errors to the user, so failures are swallowed.
  const endpoint = getVitalsEndpoint();
  if (!endpoint) return;

  try {
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      /* Endpoint unreachable or blocked — ignore. */
    });
  } catch {
    /* Ignore synchronous fetch errors (invalid URL, blocked by policy). */
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
