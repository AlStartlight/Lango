'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ChopThumbnail } from './atomics/ChopThumbnail';
import AnimatedSection from './molecules/AnimatedSection';

export default function LearnWithPeople() {
  const { t } = useTranslation();
  return (
    <section className="w-full py-20 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <AnimatedSection direction="left">
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                   <span className="text-4xl md:text-5xl font-bold">{t('home.learnWithPeople.titleLine1')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                   <span className="text-4xl md:text-5xl font-bold">{t('home.learnWithPeople.titleLine2')}</span>
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="huge" nospace>
                     {t('home.learnWithPeople.fun')}
                  </ChopThumbnail>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                {t('home.learnWithPeople.description')}
              </p>
            </div>
          </AnimatedSection>

          {/* Right - Image */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="/images/home/home2.png"
                alt="Students learning together"
                width={600}
                height={450}
                className="w-full h-auto object-cover rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-3xl" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
