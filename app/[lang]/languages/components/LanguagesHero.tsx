'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import ScrollIndicator from '@/components/molecules/ScrollIndicator';
import { useTranslation } from 'react-i18next';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
export default function LanguagesHero() {
  const { t } = useTranslation();
  return (
    <section className="w-full py-12 md:pb-24 px-4 md:px-6 bg-lime-300">
      <div className="max-w-7xl mx-auto py-10 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4 md:space-y-6 pt-4 md:pt-6"
          >
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-black">
                <span className="inline-block mr-2 relative">
                  <ChopThumbnail bgcolor="blue" textcolor="white" textsize="xtrahuge" nospace>
                    {t('howItWorks.hero.tagline1')}
                  </ChopThumbnail>
                </span>
                <span className="block md:inline">{t('languages.hero.title')}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-3xl md:text-6xl lg:text-7xl font-extrabold">{t('languages.hero.subtitle1')}</span>
                <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xtrahuge" nospace>
                  {t('languages.hero.subtitle2')}
                </ChopThumbnail>
              </div>
            </div>

            <p className="text-black/70 text-base md:text-lg max-w-lg">
              {t('languages.hero.description')}
            </p>

            <div className="mt-4 md:mt-6">
              <ScrollIndicator />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-72 md:h-80 lg:h-96"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute right-0 top-0 w-full max-w-[280px] md:max-w-[520px] lg:max-w-[540px] overflow-hidden rounded-[40px] md:rounded-[64px]"
            >
              <Image
                src="/images/aboutus/our01.png"
                alt="Languages hero"
                width={540}
                height={300}
                className="w-full h-40 md:h-72 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="absolute left-0 -bottom-10 md:-bottom-28 w-full max-w-[240px] md:max-w-[420px] overflow-hidden rounded-[40px] md:rounded-[64px]"
            >
              <Image
                src="/images/aboutus/our02.png"
                alt="Languages hero"
                width={420}
                height={220}
                className="w-full h-32 md:h-44 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="absolute right-4 md:right-8 -bottom-10 md:-bottom-28 w-16 h-16 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-black/20 bg-white"
            >
              <Image
                src="/images/aboutus/our03.png"
                alt="Languages hero"
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
