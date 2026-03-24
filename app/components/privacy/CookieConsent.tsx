'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getConsent, setConsent, acceptAll, rejectAll, shouldShowBanner, type CookieConsent } from '@/utils/consent';

export default function CookieConsent() {
  const { t, i18n } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowBanner(shouldShowBanner());
    setConsentState(getConsent());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setConsentState(getConsent());
      setShowBanner(shouldShowBanner());
    };

    window.addEventListener('cookie-consent-updated', handleUpdate);
    window.addEventListener('cookie-consent-revoked', handleUpdate);

    return () => {
      window.removeEventListener('cookie-consent-updated', handleUpdate);
      window.removeEventListener('cookie-consent-revoked', handleUpdate);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    if (consent) {
      setConsent(consent);
    }
    setShowBanner(false);
    setShowDetails(false);
  };

  const handleToggle = (type: keyof Omit<CookieConsent, 'timestamp' | 'version'>) => {
    if (type === 'essential') return; // Cannot disable essential cookies
    setConsentState((prev) => prev ? { ...prev, [type]: !prev[type] } : null);
  };

  const locale = i18n.language || 'en';

  if (!mounted || !showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {!showDetails ? (
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('cookies.title', 'We use cookies')}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {t('cookies.description', 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.')}
                      </p>
                      <Link
                        href={`/${locale}/cookies`}
                        className="text-sm text-green-600 hover:text-green-700 underline"
                      >
                        {t('cookies.learnMore', 'Learn more about our Cookie Policy')}
                      </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => setShowDetails(true)}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {t('cookies.customize', 'Customize')}
                      </button>
                      <button
                        onClick={handleRejectAll}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {t('cookies.rejectAll', 'Reject All')}
                      </button>
                      <button
                        onClick={handleAcceptAll}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                      >
                        {t('cookies.acceptAll', 'Accept All')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('cookies.customizeTitle', 'Cookie Preferences')}
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {/* Essential Cookies */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {t('cookies.essential.title', 'Essential Cookies')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t('cookies.essential.description', 'Required for the website to function properly.')}
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500 opacity-50"
                        />
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {t('cookies.analytics.title', 'Analytics Cookies')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t('cookies.analytics.description', 'Help us understand how visitors interact with our website.')}
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={consent?.analytics || false}
                          onChange={() => handleToggle('analytics')}
                          className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {t('cookies.marketing.title', 'Marketing Cookies')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t('cookies.marketing.description', 'Used to deliver personalized advertisements.')}
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={consent?.marketing || false}
                          onChange={() => handleToggle('marketing')}
                          className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Functional Cookies */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {t('cookies.functional.title', 'Functional Cookies')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t('cookies.functional.description', 'Enable personalized features and remember your preferences.')}
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={consent?.functional || false}
                          onChange={() => handleToggle('functional')}
                          className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {t('cookies.back', 'Back')}
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                    >
                      {t('cookies.savePreferences', 'Save Preferences')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
