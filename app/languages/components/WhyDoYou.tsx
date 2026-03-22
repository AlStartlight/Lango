'use client';

import { motion } from 'framer-motion';
import LanguageCard from '../../components/atomics/LanguageCard';

const languages = [
  { name: 'English', flag: '/images/flags/england.png', speakers: '1.5B' },
  { name: 'Spanish', flag: '/images/flags/spain.png', speakers: '550M' },
  { name: 'French', flag: '/images/flags/france.png', speakers: '280M' },
  { name: 'German', flag: '/images/flags/germany.png', speakers: '135M' },
  { name: 'Italian', flag: '/images/flags/italy.png', speakers: '68M' },
  { name: 'Dutch', flag: '/images/flags/netherlands.png', speakers: '25M' },
  { name: 'Portuguese', flag: '/images/flags/portugal.png', speakers: '260M' },
  { name: 'Arabic', flag: '/images/flags/arab.png', speakers: '420M' },
  { name: 'Hindi', flag: '/images/flags/India.png', speakers: '600M' },
  { name: 'Bengali', flag: '/images/flags/bangli.png', speakers: '260M' },
];
export default function WhyDoYou() {
  return (
    <section className="w-full py-16 max-h-svh md:py-24 px-6 bg-lime-300">
      <div className="max-w-7xl mx-auto py-20">
      <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
            Explore Our Languages
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {languages.map((lang, index) => (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <LanguageCard
                  name={lang.name}
                  flagSrc={lang.flag}
                  speakers={lang.speakers}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
    </section>
  )
}