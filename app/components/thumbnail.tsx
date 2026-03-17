'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from './atomics/ChopThumbnail';
import ScrollIndicator from './molecules/ScrollIndicator';

export default function HomeThumbnail() {
  return (
    <section className="w-full py-16 md:py-20 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-4xl md:text-6xl font-light">Lango learns how you</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-4xl md:text-6xl font-light">learn, and</span>
                <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xtrahuge" nospace>
                  adapts
                </ChopThumbnail>
              </div>
              <span className="text-4xl md:text-6xl font-light block">accordingly</span>
            </div>

            <p className="text-gray-600 text-lg max-w-lg">
              Our mission is to build the best platform people use to learn a
              language learning, making the world a better,
              brighter place to live in.
            </p>

            <ScrollIndicator />
          </motion.div>

          {/* Right - Image & Language Selector */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="/images/hero.png"
                alt="Student learning"
                width={600}
                height={500}
                className="w-full h-auto object-cover rounded-3xl"
              />
            </div>

            {/* Floating Language Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute top-4 right-4 bg-white rounded-2xl shadow-xl p-4 min-w-45"
            >
              <div className="space-y-2">
                {[
                  { lang: 'French', flag: '🇫🇷', active: true },
                  { lang: 'Spanish', flag: '🇪🇸', active: false },
                  { lang: 'Arabic', flag: '🇸🇦', active: false },
                  { lang: 'English', flag: '🇬🇧', active: false },
                ].map((item) => (
                  <div
                    key={item.lang}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      item.active
                        ? 'bg-green-500 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{item.flag}</span>
                    <span className="text-sm font-medium">{item.lang}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}