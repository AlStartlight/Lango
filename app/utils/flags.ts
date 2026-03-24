export const flagImages: Record<string, string> = {
  en: '/images/flags/england.png',
  es: '/images/flags/spain.png',
  fr: '/images/flags/france.png',
  de: '/images/flags/germany.png',
  it: '/images/flags/italy.png',
  nl: '/images/flags/netherlands.png',
  pt: '/images/flags/portugal.png',
  ar: '/images/flags/arab.png',
  hi: '/images/flags/India.png',
  bn: '/images/flags/bangli.png',
  id: '/images/flags/indonesia.svg',
  jp: '/images/flags/japan.svg',
  ko: '/images/flags/south-korea.svg',
};

export const languageOptions = [
  { code: 'en', name: 'English', flag: flagImages.en },
  { code: 'es', name: 'Español', flag: flagImages.es },
  { code: 'id', name: 'Bahasa Indonesia', flag: flagImages.id },
  { code: 'jp', name: '日本語', flag: flagImages.jp },
  { code: 'hi', name: 'हिन्दी', flag: flagImages.hi },
  { code: 'de', name: 'Deutsch', flag: flagImages.de },
  { code: 'ar', name: 'العربية', flag: flagImages.ar },
  { code: 'fr', name: 'Français', flag: flagImages.fr },
  { code: 'pt', name: 'Português', flag: flagImages.pt },
  { code: 'it', name: 'Italiano', flag: flagImages.it },
  { code: 'nl', name: 'Nederlands', flag: flagImages.nl },
  { code: 'ko', name: '한국어', flag: flagImages.ko },
];

export const heroFlags = [
  { code: 'ES', flag: flagImages.es },
  { code: 'FR', flag: flagImages.fr },
  { code: 'DE', flag: flagImages.de },
  { code: 'IT', flag: flagImages.it },
  { code: 'JP', flag: flagImages.jp },
];

export const languagesList = [
  { name: 'English', flag: flagImages.en, href: '/learn/english' },
  { name: 'Spanish', flag: flagImages.es, href: '/learn/spanish' },
  { name: 'French', flag: flagImages.fr, href: '/learn/french' },
  { name: 'German', flag: flagImages.de, href: '/learn/german' },
  { name: 'Italian', flag: flagImages.it, href: '/learn/italian' },
  { name: 'Dutch', flag: flagImages.nl, href: '/learn/dutch' },
  { name: 'Portuguese', flag: flagImages.pt, href: '/learn/portuguese' },
  { name: 'Arabic', flag: flagImages.ar, href: '/learn/arabic' },
  { name: 'India', flag: flagImages.hi, href: '/learn/hindi' },
  { name: 'Bengali', flag: flagImages.bn, href: '/learn/bengali' },
];

export function getFlagPath(locale: string): string {
  return flagImages[locale] || flagImages.en;
}
