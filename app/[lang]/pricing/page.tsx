import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from "@/components/header";
import PricingHero from "./components/PricingHero";
import PricingCards from "./components/PricingCards";
import Newsletter from "@/components/organisms/Newsletter";
import Footer from "@/components/organisms/Footer";
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
    title: translations.seo.pricing.title,
    description: translations.seo.pricing.description,
    path: '/pricing',
    locale: lang,
    image: '/images/og-pricing.jpg',
  });
}

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <PricingHero />
      <PricingCards />
      <Newsletter />
      <Footer />
    </main>
  );
}
