'use client';

import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';

const features = [
  {
    icon: '💼',
    title: 'For Work & Career',
    desc: 'Boost your career by learning business language skills used in global companies.',
  },
  {
    icon: '🎓',
    title: 'For Students',
    desc: 'Prepare for exams, study abroad, or simply expand your horizons with new languages.',
  },
  {
    icon: '✈️',
    title: 'For Travel',
    desc: 'Navigate new countries with confidence. Learn essential phrases for your next trip.',
  },
];

export default function LanguageForAll() {
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
            <span className="text-3xl md:text-4xl font-bold">Language Learning For</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
              All
            </ChopThumbnail>
            <span className="text-3xl md:text-4xl font-bold">People</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="text-4xl mb-4">{feat.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
