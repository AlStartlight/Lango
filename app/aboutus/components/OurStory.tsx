'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import AnimatedSection from '../../components/molecules/AnimatedSection';

export default function OurStory() {
  return (
    <section className="w-full py-20 px-4  border-y border-gray-800/10" style={{backgroundColor:"#FFFAE9"}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Images */}
          <AnimatedSection direction="left">
            <div className="grid grid-cols-1 gap-4 relative">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl w-full"
              >
                <Image
                  src="/images/aboutus/watch01.png"
                  alt="Story image 1"
                  width={800}
                  height={300}
                  className="w-full h-96 object-contain rounded-3xl"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl overflow-hidden mt-8 absolute right-0 -bottom-16"
              >
                <Image
                  src="/images/aboutus/watch02.png"
                  alt="Story image 2"
                  width={300}
                  height={300}
                  className="w-40 h-52 object-cover rounded-full"
                />
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Right - Text */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-3xl md:text-4xl font-bold">Watch Our Awesome</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
                    Story
                  </ChopThumbnail>
                  <span className="text-3xl md:text-4xl font-bold">in Language</span>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg">
                Founded in 2020, Lingo is born from a simple idea: language should connect
                people, not create barriers. After traveling the world and experiencing firsthand
                the challenges of communication across cultures, our founders built a platform
                that makes language learning accessible, fun, and effective.
              </p>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg">
                Under the International Language Education Association (ILEA), we have partnered
                with educators around the globe. Our AI-powered platform adapts to each
                learner&apos;s unique style, implementing the best methodologies from language education
                research. Today, we serve learners in over 50 countries.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
