'use client';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: string;
}

const CONSENT_KEY = 'lango_cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 180; // 6 months

export const defaultConsent: CookieConsent = {
  essential: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  functional: false,
  timestamp: 0,
  version: CONSENT_VERSION,
};

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    
    const consent = JSON.parse(stored) as CookieConsent;
    
    // Check if consent has expired (6 months)
    const expiryTime = consent.timestamp + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (Date.now() > expiryTime) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    
    // Check version
    if (consent.version !== CONSENT_VERSION) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    
    return consent;
  } catch {
    localStorage.removeItem(CONSENT_KEY);
    return null;
  }
}

export function setConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === 'undefined') return;
  
  const fullConsent: CookieConsent = {
    ...defaultConsent,
    ...consent,
    essential: true, // Always true
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  
  localStorage.setItem(CONSENT_KEY, JSON.stringify(fullConsent));
  
  // Dispatch custom event for components to react
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: fullConsent }));
}

export function acceptAll(): void {
  setConsent({
    analytics: true,
    marketing: true,
    functional: true,
  });
}

export function rejectAll(): void {
  setConsent({
    analytics: false,
    marketing: false,
    functional: false,
  });
}

export function hasConsent(type: keyof Omit<CookieConsent, 'timestamp' | 'version'>): boolean {
  const consent = getConsent();
  if (!consent) return false;
  return consent[type];
}

export function hasAnyConsent(): boolean {
  return getConsent() !== null;
}

export function revokeConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent('cookie-consent-revoked'));
}

export function shouldShowBanner(): boolean {
  return !hasAnyConsent();
}
