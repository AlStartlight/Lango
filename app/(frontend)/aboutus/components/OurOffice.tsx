'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import AnimatedSection from '@/components/molecules/AnimatedSection';

export default function OurOffice() {
  return (
    <section className="w-full py-20 md:py-44 px-4 border-y border-gray-800/10" style={{backgroundColor:"#FFFAE9"}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Images (repositioned to match design) */}
          <AnimatedSection direction="left">
            <div className="relative h-80 md:h-96 lg:h-96">
              {/* Top-left rounded square */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="absolute left-4 md:left-20 -top-8 md:-top-16 w-44 h-44 md:w-52 md:h-52 lg:w-72 lg:h-72 rounded-[32px] md:rounded-[40px] overflow-hidden"
              >
                <Image
                  src="/images/aboutus/our01.png"
                  alt="Office photo 1"
                  width={288}
                  height={288}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Top-right circle */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="absolute right-4 md:right-6 top-4 md:top-8 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden"
              >
                <Image
                  src="/images/aboutus/our02.png"
                  alt="Office photo 2"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Bottom-left pill */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="absolute left-0 bottom-10 md:-bottom-10 w-full max-w-[240px] md:max-w-[300px] lg:max-w-[420px] h-24 md:h-28 lg:h-36 rounded-[40px] md:rounded-[64px] overflow-hidden"
              >
                <Image
                  src="/images/aboutus/our03.png"
                  alt="Office photo 3"
                  width={420}
                  height={180}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Right - Text */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="space-y-4 md:space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl md:text-4xl font-bold">Our Beautiful</span>
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
                    Office
                  </ChopThumbnail>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg">
                Our beautiful office is located in the heart of San Francisco, California.
                It&apos;s where creativity meets innovation. Our modern workspace encourages
                collaboration and fosters a culture of learning. We have dedicated language
                labs, a cozy library, and flexible workspaces that inspire our team to
                create the best language learning experience for you.
              </p>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg">
                Visit us at our headquarters or join our virtual office. We welcome
                visitors and believe in open collaboration.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
