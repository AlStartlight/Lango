'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from './atomics/ChopThumbnail';
import AnimatedSection from './molecules/AnimatedSection';

export default function ExploreLanguage() {
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
                <p className="text-xs text-gray-500 font-medium">I want to learn</p>
                {[
                  { lang: 'Arabic', flag: '🇸🇦' },
                  { lang: 'Spanish', flag: '🇪🇸' },
                  { lang: 'French', flag: '🇫🇷' },
                ].map((item) => (
                  <div
                    key={item.lang}
                    className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    <span>{item.flag}</span>
                    <span className="text-sm font-medium">{item.lang}</span>
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
                  <span className="text-4xl md:text-5xl font-bold">Explore a Language</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-4xl md:text-5xl font-bold">With Few</span>
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="huge" nospace>
                    Clicks
                  </ChopThumbnail>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Just search for your wish and find it in seconds, it is easy now.
                Learn a new world of culture. All of our courses are curated.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
