'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import AnimatedSection from '@/components/molecules/AnimatedSection';
import { useTranslation } from 'react-i18next';

export default function OurStory() {
  const { t } = useTranslation();
  
  return (
    <section className="w-full py-16 md:py-20 px-4 border-y border-gray-800/10" style={{backgroundColor:"#FFFAE9"}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <AnimatedSection direction="left">
            <div className="grid grid-cols-1 gap-4 relative h-72 md:h-96">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl w-full"
              >
                <Image
                  src="/images/aboutus/watch01.png"
                  alt="Story image 1"
                  width={800}
                  height={300}
                  className="w-full h-56 md:h-96 object-contain rounded-3xl"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl overflow-hidden mt-4 md:mt-8 absolute right-0 -bottom-8 md:-bottom-16"
              >
                <Image
                  src="/images/aboutus/watch02.png"
                  alt="Story image 2"
                  width={300}
                  height={300}
                  className="w-24 h-32 md:w-40 md:h-52 object-cover rounded-full"
                />
              </motion.div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.2}>
            <div className="space-y-4 md:space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl md:text-4xl font-bold">{t('about.story.subtitle')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
                    {t('about.story.title') }
                  </ChopThumbnail>
                  <span className="text-2xl md:text-4xl font-bold">{t('about.story.missionTitle')}</span>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg">
                {t('about.story.description')}
              </p>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg">
                {t('about.story.missionText')}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
