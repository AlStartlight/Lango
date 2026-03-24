import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from "@/components/header";
import AboutHero from "./components/AboutHero";
import OurStory from "./components/OurStory";
import OurTeam from "./components/OurTeam";
import OurOffice from "./components/OurOffice";
import MapSection from "./components/MapSection";
import Newsletter from "@/components/organisms/Newsletter";
import Footer from "@/components/organisms/Footer";
import { generatePageMetadata, getTranslations, isValidLanguage } from '@/utils/metadata';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

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
    title: translations.seo.about.title,
    description: translations.seo.about.description,
    path: '/aboutus',
    locale: lang,
    image: '/images/og-about.jpg',
  });
}

export default function AboutUsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://lingo.com' },
        { name: 'About Us', url: 'https://lingo.com/aboutus' },
      ]} />
      <Header />
      <AboutHero />
      <OurStory />
      <OurTeam />
      <OurOffice />
      <MapSection />
      <Newsletter />
      <Footer />
    </main>
  );
}
