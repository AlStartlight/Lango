'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import Button from '../../components/atomics/button';
import AnimatedSection from '../../components/molecules/AnimatedSection';

export default function OurTeam() {
  return (
    <section className="w-full py-20 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <AnimatedSection direction="left">
            <div className="space-y-6">
              <div>
                <span className="text-3xl md:text-4xl font-bold block">Something About Our</span>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-3xl md:text-4xl font-bold">Language</span>
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
                    Team
                  </ChopThumbnail>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg">
                Our team is made up of passionate linguists, educators,
                and technology experts from around the world. We bring
                together the best minds in language education to create
                innovative learning experiences that help you achieve
                fluency faster. We are constantly evolving
                our methods based on the latest research.
              </p>
              <Button href="/reviews" text="Read More" color="black" size="md" />
            </div>
          </AnimatedSection>

          {/* Right - Team Images */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl overflow-hidden"
              >
                <Image
                  src="/images/speakers/Mask1.png"
                  alt="Team member"
                  width={300}
                  height={300}
                  className="w-full h-52 object-cover rounded-3xl"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl overflow-hidden mt-8"
              >
                <Image
                  src="/images/speakers/Mask2.png"
                  alt="Team member"
                  width={300}
                  height={300}
                  className="w-full h-52 object-cover rounded-3xl"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl overflow-hidden -mt-4 col-span-2"
              >
                <Image
                  src="/images/speakers/Mask3.png"
                  alt="Team collaboration"
                  width={600}
                  height={250}
                  className="w-full h-48 object-cover rounded-3xl"
                />
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
