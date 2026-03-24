'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import Button from '@/components/atomics/button';
import { useTranslation } from 'react-i18next';

export default function StartLearning() {
  const { t } = useTranslation();
  
  return (
    <section id="start" className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-3xl overflow-hidden">
                <Image
                  src="/images/hero.png"
                  alt="Student 1"
                  width={300}
                  height={350}
                  className="w-full h-48 md:h-96 object-fill rounded-3xl"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-3xl md:text-4xl font-bold">{t('howItWorks.startLearning.startLearning')}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-3xl md:text-4xl font-bold">{t('howItWorks.startLearning.languagesFor')}</span>
                <ChopThumbnail bgcolor="blue" textcolor="white" textsize="xxxlarge" nospace>
                  {t('howItWorks.startLearning.free')}
                </ChopThumbnail>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
              {t('howItWorks.hero.description')}
            </p>
            <Button href="/languages" text={t('cta.tryFree')} color="blue" size="lg" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
