'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChopThumbnail } from './atomics/ChopThumbnail';
import AnimatedSection from './molecules/AnimatedSection';

export default function ExploreLanguage() {
  const { t } = useTranslation();
  const languages = [
    { key: 'arabic', flag: '/images/flags/arab.png' },
    { key: 'spanish', flag: '/images/flags/spain.png' },
    { key: 'french', flag: '/images/flags/france.png' },
  ];
  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Colorful Letters Image */}
          <AnimatedSection direction="left">
            <div className="relative">
              <div className="bg-gray-100 rounded-3xl overflow-hidden p-8">
                <Image
                  src="/images/hero.png"
                  alt="Colorful language letters"
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>

              {/* Floating Language Selection Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-lg p-4 space-y-2"
              >
                 <p className="text-xs text-gray-500 font-medium">{t('home.explore.iWantToLearn')}</p>
                 {languages.map((item) => (
                  <div
                     key={item.key}
                    className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    <Image 
                      src={item.flag} 
                      alt={t('home.explore.languages.' + item.key)} 
                      width={24} 
                      height={16} 
                      className="w-6 h-4 object-cover rounded-sm" 
                    />
                     <span className="text-sm font-medium">{t('home.explore.languages.' + item.key)}</span>
                    <span className="ml-auto text-gray-400">›</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Right - Text */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                   <span className="text-4xl md:text-5xl font-bold">{t('home.explore.titleLine1')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                   <span className="text-4xl md:text-5xl font-bold">{t('home.explore.titleLine2')}</span>
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="huge" nospace>
                     {t('home.explore.clicks')}
                  </ChopThumbnail>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                {t('home.explore.description')}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
