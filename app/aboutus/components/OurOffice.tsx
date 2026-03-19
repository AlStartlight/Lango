'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import AnimatedSection from '../../components/molecules/AnimatedSection';

export default function OurOffice() {
  return (
    <section className="w-full py-44 px-4  border-y border-gray-800/10" style={{backgroundColor:"#FFFAE9"}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Images (repositioned to match design) */}
          <AnimatedSection direction="left">
            <div className="relative h-96 md:h-96 lg:h-96">
              {/* Top-left rounded square */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="absolute left-20 -top-16 w-52 h-52 md:w-72 md:h-72 rounded-[40px] overflow-hidden "
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
                className="absolute right-6 top-8 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden "
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
                className="absolute left-0 -bottom-10 w-[300px] md:w-[420px] h-28 md:h-36 rounded-[64px] overflow-hidden "
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
