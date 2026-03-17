'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import ScrollIndicator from '../../components/molecules/ScrollIndicator';

export default function AboutHero() {
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
              <span className="text-4xl md:text-6xl font-bold block">Saving the World One</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-4xl md:text-6xl font-bold">Language</span>
                <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xtrahuge" nospace>
                  at a Time
                </ChopThumbnail>
              </div>
            </div>

            <p className="text-gray-600 text-lg max-w-lg">
              Our mission is to build the best platform people use for learning a
              language, making the world a better, brighter place to live in, where
              everybody gets a chance.
            </p>

            <ScrollIndicator />
          </motion.div>

          {/* Right - Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl overflow-hidden"
              >
                <Image
                  src="/images/speakers/Mask1.png"
                  alt="Team member 1"
                  width={300}
                  height={350}
                  className="w-full h-56 object-cover rounded-3xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-3xl overflow-hidden mt-6"
              >
                <Image
                  src="/images/speakers/Mask2.png"
                  alt="Team member 2"
                  width={300}
                  height={350}
                  className="w-full h-56 object-cover rounded-3xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="rounded-3xl overflow-hidden -mt-6"
              >
                <Image
                  src="/images/speakers/Mask3.png"
                  alt="Team member 3"
                  width={300}
                  height={350}
                  className="w-full h-56 object-cover rounded-3xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="rounded-3xl overflow-hidden"
              >
                <Image
                  src="/images/speakers/Mask4.png"
                  alt="Team member 4"
                  width={300}
                  height={350}
                  className="w-full h-56 object-cover rounded-3xl"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
