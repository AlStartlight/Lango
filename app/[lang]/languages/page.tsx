import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from "@/components/header";
import LanguagesHero from "./components/LanguagesHero";
import LanguageFeatures from "./components/LanguageFeatures";
import Newsletter from "@/components/organisms/Newsletter";
import Footer from "@/components/organisms/Footer";
import WhyDoYou from "./components/WhyDoYou";
import { generatePageMetadata, getTranslations, isValidLanguage } from '@/utils/metadata';

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (!isValidLanguage(lang)) {
    notFound();
  }

  const translations = await getTranslations(lang);
  
  return generatePageMetadata({
    title: translations.seo.languages.title,
    description: translations.seo.languages.description,
    path: '/languages',
    locale: lang,
    image: '/images/og-languages.jpg',
  });
}

export default function LanguagesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <LanguagesHero />
      <WhyDoYou />
      <LanguageFeatures />
      <Newsletter />
      <Footer />
    </main>
  );
}
