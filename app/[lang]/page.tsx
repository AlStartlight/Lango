import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from "@/components/header";
import HomeThumbnail from "@/components/thumbnail";
import ExploreLanguage from "@/components/ExploreLanguage";
import LearnWithPeople from "@/components/LearnWithPeople";
import LearnTogether from "@/components/LearnTogether";
import Newsletter from "@/components/organisms/Newsletter";
import Footer from "@/components/organisms/Footer";
import { languages, type Language } from '@/i18n-config';

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (!languages.includes(lang as Language)) {
    notFound();
  }

  // Import translation file
  const translations = await import(`@/locales/${lang}.json`).then(m => m.default);
  
  const title = translations.seo.home.title;
  const description = translations.seo.home.description;
  
  const baseUrl = 'https://lango.com';
  const url = `${baseUrl}/${lang}`;
  const image = `${baseUrl}/images/og-home.jpg`;

  const languageAlternates: Record<string, string> = {};
  languages.forEach((l) => {
    languageAlternates[l] = `${baseUrl}/${l}`;
  });

  const localeMap: Record<string, string> = {
    en: 'en_US', es: 'es_ES', id: 'id_ID', jp: 'ja_JP', hi: 'hi_IN',
    de: 'de_DE', ar: 'ar_SA', fr: 'fr_FR', pt: 'pt_PT', it: 'it_IT',
    nl: 'nl_NL', ko: 'ko_KR',
  };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Lango',
      locale: localeMap[lang] || 'en_US',
      type: 'website',
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@langoapp',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <HomeThumbnail />
      <ExploreLanguage />
      <LearnWithPeople />
      <LearnTogether />
      <Newsletter />
      <Footer />
    </main>
  );
}
