'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import Button from '../../components/atomics/button';

export default function StartLearning() {
  return (
    <section id="start" className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden">
                <Image
                  src="/images/speakers/Mask1.png"
                  alt="Student 1"
                  width={300}
                  height={350}
                  className="w-full h-64 object-cover rounded-3xl"
                />
              </div>
              <div className="rounded-3xl overflow-hidden mt-8">
                <Image
                  src="/images/speakers/Mask2.png"
                  alt="Student 2"
                  width={300}
                  height={350}
                  className="w-full h-64 object-cover rounded-3xl"
                />
              </div>
            </div>
            {/* Flag badges floating */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              {['🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹'].map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md text-xl"
                >
                  {flag}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-3xl md:text-4xl font-bold">Start Learning</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-3xl md:text-4xl font-bold">Languages For</span>
                <ChopThumbnail bgcolor="blue" textcolor="white" textsize="xxxlarge" nospace>
                  Free
                </ChopThumbnail>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
              Learn to speak Spanish, French, German and more with top handpicked professional language tutors.
            </p>
            <Button href="/languages" text="Try For Free" color="blue" size="lg" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
