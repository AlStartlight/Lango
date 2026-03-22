'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import LanguageCard from '../../components/atomics/LanguageCard';
import ScrollIndicator from '../../components/molecules/ScrollIndicator';

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

export default function LanguagesHero() {
  return (
    <section className="w-full py-16 max-h-svh md:py-24 px-6 bg-lime-300">
      <div className="max-w-7xl mx-auto py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 pt-6"
          >
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-black">
                <span className="inline-block mr-2 relative">
                  <span className="inline-block rounded-full border-2 border-black px-4 py-1 -translate-y-1">Learn</span>
                </span>
                <span className="block md:inline">Any Language</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl md:text-6xl lg:text-7xl font-extrabold">From Home</span>
                <span className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-lime-600">With Ease</span>
              </div>
            </div>

            <p className="text-black/70 text-lg max-w-lg">
              Choose from 10+ languages and start your journey today. Our native speakers are ready to help you master any language.
            </p>

            <div className="mt-6">
              <ScrollIndicator />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-96 md:h-80 lg:h-96"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute right-0 top-0 w-[420px] md:w-[520px] lg:w-[540px] overflow-hidden rounded-[64px]"
            >
              <Image
                src="/images/aboutus/our01.png"
                alt="Languages hero"
                width={540}
                height={300}
                className="w-full h-56 md:h-72 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="absolute left-0 -bottom-28 w-[360px] md:w-[420px] overflow-hidden rounded-[64px]"
            >
              <Image
                src="/images/aboutus/our02.png"
                alt="Languages hero"
                width={420}
                height={220}
                className="w-full h-44 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="absolute right-8 -bottom-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-black/20 bg-white"
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
