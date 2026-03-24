import { Metadata } from 'next';
import { languages, type Language } from '@/i18n-config';

const baseUrl = 'https://lingo.com';

const localeMap: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  id: 'id_ID',
  jp: 'ja_JP',
  hi: 'hi_IN',
  de: 'de_DE',
  ar: 'ar_SA',
  fr: 'fr_FR',
  pt: 'pt_PT',
  it: 'it_IT',
  nl: 'nl_NL',
  ko: 'ko_KR',
};

interface MetadataOptions {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  image = '/images/og-default.jpg',
  type = 'website',
  noIndex = false,
}: MetadataOptions): Metadata {
  const url = `${baseUrl}/${locale}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  const languageAlternates: Record<string, string> = {};
  languages.forEach((lang) => {
    languageAlternates[lang] = `${baseUrl}/${lang}${path}`;
  });

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      languages: languageAlternates,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Lingo',
      locale: localeMap[locale] || 'en_US',
      type,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@lingoapp',
      creator: '@lingoapp',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export async function getTranslations(locale: string) {
  return await import(`@/locales/${locale}.json`).then(m => m.default);
}

export function isValidLanguage(lang: string): lang is Language {
  return languages.includes(lang as Language);
}
