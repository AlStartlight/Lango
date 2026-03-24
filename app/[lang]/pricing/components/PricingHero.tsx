'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import ScrollIndicator from '@/components/molecules/ScrollIndicator';
import { useTranslation } from 'react-i18next';

export default function PricingHero() {
  const { t } = useTranslation();
  
  return (
    <section className="w-full pb-12 pt-0 md:pb-24 px-4 md:px-6 bg-lime-300">
      <div className="max-w-7xl mx-auto py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 pt-6"
          >
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-black">
                <span className="inline-block mr-2 relative">
                  <span className="inline-block rounded-full border-2 border-black px-4 py-1 -translate-y-1">{t('pricing.hero.tagline1')}</span>
                </span>
                <span className="block md:inline">{t('pricing.hero.title')}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-3xl md:text-6xl lg:text-7xl font-extrabold">{t('pricing.hero.subtitle')}</span>
              </div>
            </div>

            <p className="text-black/70 text-lg max-w-lg">
              {t('pricing.hero.description')}
            </p>

            <div className="mt-6">
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
                src="/images/aboutus/something01.png"
                alt="Pricing hero"
                width={540}
                height={300}
                className="w-full h-56 md:h-72 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="absolute left-0 -bottom-10 md:-bottom-28 w-full max-w-[240px] md:max-w-[420px] overflow-hidden rounded-[40px] md:rounded-[64px]"
            >
              <Image
                src="/images/aboutus/something02.png"
                alt="Pricing hero"
                width={420}
                height={220}
                className="w-full h-44 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="absolute right-4 md:right-8 -bottom-10 md:-bottom-28 w-16 h-16 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-black/20 bg-white"
            >
              <Image
                src="/images/aboutus/something03.png"
                alt="Pricing hero"
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
