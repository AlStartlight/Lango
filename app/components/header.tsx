"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { key: 'nav.about', href: '/aboutus' },
  { key: 'nav.how', href: '/how-its-works' },
  { key: 'nav.languages', href: '/languages' },
  { key: 'nav.reviews', href: '/reviews' },
  { key: 'nav.pricing', href: '/pricing' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full backdrop-blur-md supports-backdrop-filter:bg-lime-300/80 border-b border-gray-800/10"
    >
      <nav className="w-full px-4 py-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/Logo.png" alt="Lingo Logo" width={82} height={32} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 relative group"
              >
                {t(link.key)}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
{/* Language picker */}
          <div className="hidden md:flex items-center ml-4 relative">
            <button
              onClick={() => setIsLangOpen((s) => !s)}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm  shadow-sm"
              aria-label="Select language"
            >
              <span className="text-xl">{languages.find((l) => l.code === i18n.language)?.flag ?? '🌐'}</span>
              <span className="text-gray-700">{(i18n.language || 'en').toUpperCase()}</span>
              <Image src="/images/icons/ic_bottom.png" alt="Select language" width={12} height={12} className={`transform transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full text-left flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-md"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm text-gray-700">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* CTA Button */}
          <div className="hidden md:flex">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signin"
                className="bg-green-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors duration-200 shadow-sm"
              >
                {t('cta.signup')}
              </Link>
            </motion.div>
          </div>

          

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-800 hover:text-gray-600 p-2"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 space-y-3 items-center justify-center flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <Link
                  href="/signin"
                  className="block bg-green-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold text-center hover:bg-green-600 transition-colors mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </nav>
    </motion.header>
  );
}