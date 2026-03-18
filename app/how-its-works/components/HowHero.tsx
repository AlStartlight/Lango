'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import ScrollIndicator from '../../components/molecules/ScrollIndicator';

export default function HowHero() {
  return (
    <section className="w-full py-16 md:py-32 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 items-center gap-4"
        >

          <div className="flex flex-col order-2 md:order-1 text-center md:text-left">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-2"
            >
              <div className="flex flex-wrap items-start justify-start gap-3">
                <ChopThumbnail bgcolor="transparent" textcolor="black" textsize="xtrahuge" nospace>
                  Speak
                </ChopThumbnail>
                <span className="text-4xl md:text-6xl font-bold">✋</span>
                <span className="text-4xl md:text-6xl font-bold">A New</span>
              </div>
              <div className="flex flex-wrap items-start justify-start gap-3">
                <ChopThumbnail bgcolor="blue" textcolor="white" textsize="xtrahuge" nospace>
                  Language
                </ChopThumbnail>
                <span className="text-4xl md:text-6xl font-bold">With</span>
              </div>
              <div className="flex flex-wrap items-start justify-start gap-3">
                <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xtrahuge" nospace>
                  Confidence.
                </ChopThumbnail>
              </div>
            </motion.div>

            {/* Subtitle + Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="justify-start items-start mt-8 space-y-4"
            >
              <p className="text-gray-600 text-lg max-w-xl ">
                Learn to speak Spanish, French, German and more with top handpicked professional language tutors.
              </p>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#start"
                className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                Start Learning
              </motion.a>
            </motion.div>

            {/* Profile Avatars row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-start justify-start gap-4 mt-8"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-lime-300 overflow-hidden">
                    <Image
                      src={`/images/speakers/Mask${i}.png`}
                      alt={`User ${i}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {['🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇯🇵'].map((flag, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="text-2xl"
                  >
                    {flag}
                  </motion.span>
                ))}
              </div>
            </motion.div>

          </div>
          <div className="order-1 md:order-2  justify-center">
            <div className="w-full max-w-175">
              <Image
                src="/images/ImagesPart.png"
                alt="Hero"
                width={809}
                height={627}
                className="w-full h-auto object-contain"
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                priority
                fetchPriority="high"
              />
            </div>
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-10">
              <ScrollIndicator />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
