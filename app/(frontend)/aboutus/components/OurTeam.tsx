'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import Button from '@/components/atomics/button';
import AnimatedSection from '@/components/molecules/AnimatedSection';

export default function OurTeam() {
  return (
    <section className="w-full py-16 md:py-20 px-4 border-b border-gray-800/10" style={{backgroundColor:"#FFFAE9"}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Text */}
          <AnimatedSection direction="left">
            <div className="space-y-4 md:space-y-6">
              <div>
                <span className="text-2xl md:text-4xl font-bold block">Something About Our</span>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-2xl md:text-4xl font-bold">Language</span>
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

          {/* Right - Team Images (positioned to match design) */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="relative h-72 md:h-80 lg:h-96">
              {/* Main large rounded capsule (center-right) */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="absolute right-4 md:right-48 top-4 md:top-8 w-full max-w-[280px] md:max-w-[360px] lg:max-w-[420px] h-44 md:h-[300px] overflow-hidden rounded-[40px] md:rounded-[56px]"
              >
                <Image
                  src="/images/aboutus/something01.png"
                  alt="Team member large"
                  width={320}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Top-right vertical oval */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="absolute right-2 md:right-6 top-0 w-20 h-28 md:w-28 md:h-36 lg:w-36 lg:h-44 rounded-[32px] md:rounded-[48px] overflow-hidden"
              >
                <Image
                  src="/images/aboutus/something02.png"
                  alt="Team member small"
                  width={144}
                  height={176}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Bottom-right overlapping rounded card */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="absolute right-2 md:right-20 -bottom-4 md:-bottom-10 w-28 h-36 md:w-36 md:h-44 lg:w-44 lg:h-56 rounded-[56px] md:rounded-[90px] overflow-hidden"
              >
                <Image
                  src="/images/aboutus/something03.png"
                  alt="Team member overlap"
                  width={176}
                  height={224}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
