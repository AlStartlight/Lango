'use client';

import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Plane } from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    titleKey: 'howItWorks.languageForAll.reasons.career',
    descKey: 'howItWorks.languageForAll.reasons.careerDesc',
  },
  {
    icon: GraduationCap,
    titleKey: 'howItWorks.languageForAll.reasons.culture',
    descKey: 'howItWorks.languageForAll.reasons.cultureDesc',
  },
  {
    icon: Plane,
    titleKey: 'howItWorks.languageForAll.reasons.travel',
    descKey: 'howItWorks.languageForAll.reasons.travelDesc',
  },
];

export default function LanguageForAll() {
  const { t } = useTranslation();
  
  return (
    <section className="w-full py-20 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-3xl md:text-4xl font-bold">{t('howItWorks.languageForAll.heading')}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
              {t('howItWorks.languageForAll.all')}
            </ChopThumbnail>
            <span className="text-3xl md:text-4xl font-bold">{t('howItWorks.languageForAll.people')}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {features.map((feat, i) => {
            const IconComponent = feat.icon;
            return (
              <motion.div
                key={feat.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <IconComponent className="w-10 h-10 mb-4 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t(feat.titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(feat.descKey)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
