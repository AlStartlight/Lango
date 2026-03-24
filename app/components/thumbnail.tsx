'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChopThumbnail } from './atomics/ChopThumbnail';
import ScrollIndicator from './molecules/ScrollIndicator';

export default function HomeThumbnail() {
  const { t } = useTranslation();
  const languages = [
    { key: 'french', flag: '/images/flags/france.png', active: true },
    { key: 'spanish', flag: '/images/flags/spain.png', active: false },
    { key: 'arabic', flag: '/images/flags/arab.png', active: false },
    { key: 'english', flag: '/images/flags/england.png', active: false },
  ];
  return (
    <section className="w-full py-16 md:py-20 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-4xl md:text-6xl font-light">{t('home.hero.titlePart1')}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-4xl md:text-6xl font-light">{t('home.hero.titlePart2')}</span>
                <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xtrahuge" nospace>
                  {t('home.hero.adapts')}
                </ChopThumbnail>
              </div>
              <span className="text-4xl md:text-6xl font-light block">{t('home.hero.titlePart3')}</span>
            </div>

            <p className="text-gray-600 text-lg max-w-lg">
              {t('home.hero.mission')}
            </p>

            <ScrollIndicator />
          </motion.div>

          {/* Right - Image & Language Selector */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="/images/hero.png"
                alt="Student learning"
                width={600}
                height={500}
                className="w-full h-auto object-cover rounded-3xl"
              />
            </div>

            {/* Floating Language Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute top-4 right-4 bg-white rounded-2xl shadow-xl p-4 min-w-45"
            >
              <div className="space-y-2">
                 {languages.map((item) => (
                  <div
                      key={item.key}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      item.active
                        ? 'bg-green-500 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Image 
                      src={item.flag} 
                      alt={t('home.hero.languages.' + item.key)} 
                      width={24} 
                      height={16} 
                      className="w-6 h-4 object-cover rounded-sm" 
                    />
                     <span className="text-sm font-medium">{t('home.hero.languages.' + item.key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}