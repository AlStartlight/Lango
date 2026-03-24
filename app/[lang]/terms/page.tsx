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
    title: translations.seo.terms.title,
    description: translations.seo.terms.description,
    path: '/terms',
    locale: lang,
    noIndex: true,
  });
}

export default async function TermsPage({ params }: Props) {
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
              {translations.legal?.terms?.title || 'Terms of Service'}
            </h1>
            
            <p className="text-sm text-gray-500 mb-8">
              {translations.legal?.lastUpdated || 'Last updated'}: March 24, 2026
            </p>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using Lingo, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
              </p>
              
              <h2>2. Description of Service</h2>
              <p>
                Lingo is an online language learning platform that connects learners with native speakers and provides interactive learning tools, including but not limited to:
              </p>
              <ul>
                <li>Live tutoring sessions with native speakers</li>
                <li>Interactive language exercises and quizzes</li>
                <li>Vocabulary and grammar lessons</li>
                <li>Progress tracking and analytics</li>
              </ul>
              
              <h2>3. Account Registration</h2>
              <p>
                You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h2>4. Subscription and Payments</h2>
              <p>
                Some features of Lingo require a paid subscription. Subscription fees are billed in advance on a monthly or annual basis. You can cancel your subscription at any time.
              </p>
              
              <h2>5. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any unlawful purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share inappropriate or offensive content</li>
                <li>Attempt to access accounts of other users</li>
                <li>Interfere with the proper functioning of the service</li>
              </ul>
              
              <h2>6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of Lingo are owned by Lingo Inc. and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              
              <h2>7. Limitation of Liability</h2>
              <p>
                Lingo shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
              
              <h2>8. Disclaimer of Warranties</h2>
              <p>
                The service is provided &quot;as is&quot; without warranties of any kind, either express or implied.
              </p>
              
              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the service.
              </p>
              
              <h2>10. Contact Information</h2>
              <p>
                For questions about these Terms, please contact us at legal@lingo.com.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
