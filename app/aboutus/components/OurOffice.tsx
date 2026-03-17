'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import AnimatedSection from '../../components/molecules/AnimatedSection';

export default function OurOffice() {
  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Images */}
          <AnimatedSection direction="left">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl overflow-hidden"
              >
                <Image
                  src="/images/speakers/Mask4.png"
                  alt="Office photo 1"
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover rounded-3xl"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl overflow-hidden mt-6"
              >
                <Image
                  src="/images/speakers/Mask1.png"
                  alt="Office photo 2"
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover rounded-3xl"
                />
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Right - Text */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-3xl md:text-4xl font-bold">Our Beautiful</span>
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
