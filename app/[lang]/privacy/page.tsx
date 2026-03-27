import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/organisms/Footer';
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
    title: translations.seo.privacy.title,
    description: translations.seo.privacy.description,
    path: '/privacy',
    locale: lang,
    noIndex: true,
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  
  if (!isValidLanguage(lang)) {
    notFound();
  }

  const translations = await getTranslations(lang);

  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      
      <section className="w-full py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {translations.legal?.privacy?.title || 'Privacy Policy'}
            </h1>
            
            <p className="text-sm text-gray-500 mb-8">
              {translations.legal?.lastUpdated || 'Last updated'}: March 24, 2026
            </p>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <h2>1. Introduction</h2>
              <p>
                Welcome to Lango (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our language learning platform.
              </p>
              
              <h2>2. Information We Collect</h2>
              <h3>Personal Information</h3>
              <ul>
                <li>Name and contact information (email address)</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely by third-party providers)</li>
                <li>Learning preferences and language selections</li>
              </ul>
              
              <h3>Usage Data</h3>
              <ul>
                <li>Lesson completion and progress data</li>
                <li>Session recordings (with consent)</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
              </ul>
              
              <h2>3. How We Use Your Information</h2>
              <ul>
                <li>To provide and maintain our language learning service</li>
                <li>To personalize your learning experience</li>
                <li>To process payments and send transaction notifications</li>
                <li>To send administrative information and updates</li>
                <li>To improve our services and develop new features</li>
                <li>To detect and prevent fraud or abuse</li>
              </ul>
              
              <h2>4. Data Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>Service providers who assist in our operations</li>
                <li>Native speakers and teachers you interact with</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>
              
              <h2>5. Your Privacy Rights</h2>
              <p>Depending on your location, you may have rights to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your data (right to be forgotten)</li>
                <li>Restrict processing of your data</li>
                <li>Data portability</li>
                <li>Object to processing</li>
              </ul>
              
              <h2>6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h2>7. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
              </p>
              
              <h2>8. Children&apos;s Privacy</h2>
              <p>
                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
              </p>
              
              <h2>9. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at privacy@lango.com or write to us at:
              </p>
              <p>
                Lango Inc.<br />
                123 Language Street<br />
                San Francisco, CA 94105<br />
                United States
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
