'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import ScrollIndicator from '@/components/molecules/ScrollIndicator';

export default function AboutHero() {
  return (
    <section className="w-full pt-2 pb-12 md:py-24 px-4 md:px-6 bg-lime-300" >
      <div className="max-w-7xl mx-auto py-10 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 pt-6"
          >
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-black">
                <span className="inline-block mr-2 relative">
                  <ChopThumbnail bgcolor="transparent" textcolor="black" textsize="xtrahuge" nospace>
                  Saving
                </ChopThumbnail>
                </span>
                <span className="block md:inline">the World</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-3xl md:text-6xl lg:text-7xl font-extrabold">One Language</span>
                <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xtrahuge" nospace>
                  at a Time
                </ChopThumbnail>
              </div>
            </div>

            <p className="text-black/70 text-base md:text-lg max-w-lg">
              Our mission is to build bridges between people and cultures by making language learning
              fun and easy through technological innovation.
            </p>

            <div className="mt-6">
              <ScrollIndicator />
            </div>
          </motion.div>

          {/* Right - Decorative Images */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-64 md:h-80 lg:h-96"
          >
            {/* Top-right large rounded capsule */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute right-0 top-0 w-full max-w-[280px] md:max-w-[420px] lg:max-w-[540px] xl:absolute overflow-hidden rounded-[40px] md:rounded-[64px]"
            >
              <Image
                src="/images/aboutus/saving01.png"
                alt="Hero top"
                width={540}
                height={300}
                className="w-full h-40 md:h-56 lg:h-72 object-cover"
              />
            </motion.div>

            {/* Bottom-left large pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="absolute left-0 -bottom-16 md:-bottom-28 w-full max-w-[240px] md:max-w-[360px] lg:max-w-[420px] xl:absolute overflow-hidden rounded-[40px] md:rounded-[64px]"
            >
              <Image
                src="/images/aboutus/saving02.png"
                alt="Hero bottom left"
                width={420}
                height={220}
                className="w-full h-32 md:h-44 object-cover"
              />
            </motion.div>

            {/* Bottom-right small circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="absolute right-4 md:right-8 -bottom-16 md:-bottom-28 w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-black/20 bg-white xl:absolute"
            >
              <Image
                src="/images/aboutus/saving03.png"
                alt="Hero small"
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
