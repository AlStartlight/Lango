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
    title: translations.seo.cookies.title,
    description: translations.seo.cookies.description,
    path: '/cookies',
    locale: lang,
    noIndex: true,
  });
}

export default async function CookiesPage({ params }: Props) {
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
              {translations.legal?.cookies?.title || 'Cookie Policy'}
            </h1>
            
            <p className="text-sm text-gray-500 mb-8">
              {translations.legal?.lastUpdated || 'Last updated'}: March 24, 2026
            </p>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <h2>1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
              
              <h2>2. Types of Cookies We Use</h2>
              
              <h3>Essential Cookies</h3>
              <p>
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt-out of these cookies.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">session_id</td>
                    <td className="py-2">Maintains your login session</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">csrf_token</td>
                    <td className="py-2">Security protection</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">consent_preferences</td>
                    <td className="py-2">Stores your cookie preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Analytics Cookies</h3>
              <p>
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">_ga</td>
                    <td className="py-2">Google Analytics visitor tracking</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">_ga_*</td>
                    <td className="py-2">Google Analytics session tracking</td>
                    <td className="py-2">2 years</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Marketing Cookies</h3>
              <p>
                These cookies are used to track visitors across websites to display relevant advertisements based on your interests.
              </p>
              
              <h2>3. How to Manage Cookies</h2>
              <p>
                You can manage your cookie preferences at any time by clicking the &quot;Cookie Settings&quot; link in our footer or through your browser settings.
              </p>
              
              <h3>Browser Settings</h3>
              <p>Most browsers allow you to:</p>
              <ul>
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies from being set</li>
                <li>Clear all cookies when you close your browser</li>
              </ul>
              
              <h2>4. Third-Party Cookies</h2>
              <p>
                Some cookies on our site are set by third-party services. We do not control these cookies. Please refer to the respective third-party privacy policies for more information.
              </p>
              
              <h2>5. Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
              </p>
              
              <h2>6. Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at privacy@lango.com.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
