import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from "@/components/header";
import ReviewsHero from "./components/ReviewsHero";
import RatingsSection from "@/components/organisms/RatingsSection";
import TestimonialsGrid from "./components/TestimonialsGrid";
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
    title: translations.seo.reviews.title,
    description: translations.seo.reviews.description,
    path: '/reviews',
    locale: lang,
    image: '/images/og-reviews.jpg',
  });
}

export default function ReviewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <ReviewsHero />
      <RatingsSection />
      <TestimonialsGrid />
      <Newsletter />
      <Footer />
    </main>
  );
}
