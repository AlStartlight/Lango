'use client';

import Header from '@/components/header';
import Footer from '@/components/organisms/Footer';
import { useTranslation } from 'react-i18next';

interface LegalPageProps {
  titleKey: string;
  contentKey: string;
  lastUpdated?: string;
}

export default function LegalPage({ titleKey, contentKey, lastUpdated }: LegalPageProps) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      
      <section className="w-full py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t(titleKey)}
            </h1>
            
            {lastUpdated && (
              <p className="text-sm text-gray-500 mb-8">
                {t('legal.lastUpdated')}: {lastUpdated}
              </p>
            )}
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: t(contentKey) }} />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
