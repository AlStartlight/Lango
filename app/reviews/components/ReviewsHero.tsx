'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import ScrollIndicator from '../../components/molecules/ScrollIndicator';

export default function ReviewsHero() {
  return (
    <section className="w-full py-16 md:py-24 px-4 border-b border-gray-800/10">
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
                <span className="text-4xl md:text-6xl font-bold">Loved by</span>
                <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xtrahuge" nospace>
                  learners
                </ChopThumbnail>
                <span className="text-4xl md:text-6xl font-bold">,</span>
              </div>
              <span className="text-4xl md:text-6xl font-light block">supported by experts.</span>
            </div>

            <ScrollIndicator />
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-fuchsia-100 to-amber-50">
              <Image
                src="/images/hero.png"
                alt="Happy learner"
                width={600}
                height={500}
                className="w-full h-auto object-cover rounded-3xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
