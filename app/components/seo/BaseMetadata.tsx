import { Metadata } from 'next';
import { languages } from '@/i18n-config';

interface BaseMetadataProps {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

export function generateMetadata({
  title,
  description,
  path,
  locale,
  image = '/images/og-default.jpg',
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: BaseMetadataProps): Metadata {
  const baseUrl = 'https://lingo.com';
  const url = `${baseUrl}/${locale}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  // Generate language alternates
  const languageAlternates: Record<string, string> = {};
  languages.forEach((lang) => {
    languageAlternates[lang] = `${baseUrl}/${lang}${path}`;
  });

  // Open Graph locale mapping
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
      publishedTime,
      modifiedTime,
      authors,
      tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
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
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-site-verification',
      yandex: 'your-yandex-verification',
      yahoo: 'your-yahoo-verification',
    },
  };
}

export default function BaseMetadata({
  title,
  description,
  path,
  locale,
  image,
  type,
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: BaseMetadataProps) {
  return null;
}
