'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import Badge from '@/components/atomics/Badge';
import { useTranslation } from 'react-i18next';

const miniTestimonials = [
  {
    key: 'jana',
    img: '/images/speakers/Mask1.png',
    langs: [
      { name: 'English', color: 'green' as const },
      { name: 'German', color: 'pink' as const },
    ],
  },
  {
    key: 'vinod',
    img: '/images/speakers/Mask2.png',
    langs: [
      { name: 'Hindi', color: 'orange' as const },
      { name: 'English', color: 'green' as const },
    ],
  },
  {
    key: 'hasan',
    img: '/images/speakers/Mask3.png',
    langs: [
      { name: 'Arabic', color: 'blue' as const },
      { name: 'German', color: 'purple' as const },
    ],
  },
];

export default function LovedByLearners() {
  const { t } = useTranslation();
  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl md:text-4xl font-bold">{t('howItWorks.lovedBy.lovedBy')}</span>
            <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
              {t('howItWorks.lovedBy.learners')}
            </ChopThumbnail>
            <span className="text-3xl md:text-4xl font-bold">,</span>
          </div>
          <span className="text-3xl md:text-4xl font-light">{t('howItWorks.lovedBy.supportedByExperts')}</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {miniTestimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image src={testimonial.img} alt={t(`howItWorks.lovedBy.testimonials.${testimonial.key}.name`)} width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-gray-900">{t(`howItWorks.lovedBy.testimonials.${testimonial.key}.name`)}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {testimonial.langs.map((l) => (
                  <Badge key={l.name} text={l.name} color={l.color} />
                ))}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{t(`howItWorks.lovedBy.testimonials.${testimonial.key}.review`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
