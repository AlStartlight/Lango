'use client';

import { hasConsent } from './consent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function isAnalyticsAllowed(): boolean {
  return hasConsent('analytics');
}

export function initGoogleAnalytics(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  
  // Check if already initialized
  if (typeof window.gtag === 'function') return;
  
  // Check consent
  if (!isAnalyticsAllowed()) return;
  
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_expires: 0, // Session cookie
  });
}

export function trackPageView(url: string): void {
  if (!isAnalyticsAllowed()) return;
  
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}

export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsAllowed()) return;
  
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...eventParams,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}

export function setUserProperties(properties: Record<string, string | number>): void {
  if (!isAnalyticsAllowed()) return;
  
  if (window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
}

export function setUserLanguage(language: string): void {
  setUserProperties({
    user_language: language,
  });
}

export function trackLanguageChange(from: string, to: string): void {
  trackEvent('language_change', {
    from_language: from,
    to_language: to,
  });
}

export function trackSignup(method: string): void {
  trackEvent('sign_up', {
    method,
  });
}

export function trackLogin(method: string): void {
  trackEvent('login', {
    method,
  });
}

export function trackPurchase(
  value: number,
  currency: string,
  items?: Array<{ item_id: string; item_name: string; price: number }>
): void {
  const params: Record<string, string | number | boolean> = {
    value,
    currency,
  };
  if (items) {
    params.items = JSON.stringify(items);
  }
  trackEvent('purchase', params);
}

export function trackLessonStart(lessonId: string, language: string): void {
  trackEvent('lesson_start', {
    lesson_id: lessonId,
    language,
  });
}

export function trackLessonComplete(lessonId: string, language: string): void {
  trackEvent('lesson_complete', {
    lesson_id: lessonId,
    language,
  });
}
