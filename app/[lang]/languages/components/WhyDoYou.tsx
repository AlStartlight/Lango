'use client';

import { motion } from 'framer-motion';
import LanguageCard from '@/components/atomics/LanguageCard';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { name: 'English', flag: '/images/flags/england.png', speakers: '1.5B', href: '/learn/english' },
  { name: 'Spanish', flag: '/images/flags/spain.png', speakers: '550M', href: '/learn/spanish' },
  { name: 'French', flag: '/images/flags/france.png', speakers: '280M', href: '/learn/french' },
  { name: 'German', flag: '/images/flags/germany.png', speakers: '135M', href: '/learn/german' },
  { name: 'Italian', flag: '/images/flags/italy.png', speakers: '68M', href: '/learn/italian' },
  { name: 'Dutch', flag: '/images/flags/netherlands.png', speakers: '25M', href: '/learn/dutch' },
  { name: 'Portuguese', flag: '/images/flags/portugal.png', speakers: '260M', href: '/learn/portuguese' },
  { name: 'Arabic', flag: '/images/flags/arab.png', speakers: '420M', href: '/learn/arabic' },
  { name: 'Hindi', flag: '/images/flags/India.png', speakers: '600M', href: '/learn/hindi' },
  { name: 'Bengali', flag: '/images/flags/bangli.png', speakers: '260M', href: '/learn/bengali' },
];

export default function WhyDoYou() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const perPage = 5;
  const pages: typeof languages[] = [];
  for (let i = 0; i < languages.length; i += perPage) {
    pages.push(languages.slice(i, i + perPage));
  }
  const pagesCount = pages.length;
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pagesCount <= 1) return;
    const id = setInterval(() => setActive((s) => (s + 1) % pagesCount), 4000);
    return () => clearInterval(id);
  }, [pagesCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = 'transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)';
    track.style.transform = `translateX(-${active * 100}%)`;
  }, [active]);

  return (
    <section className="w-full py-12 md:py-24 px-4 md:px-6 bg-lime-300">
      <div className="max-w-7xl mx-auto py-10 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 md:mt-20"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-center text-black mb-8 md:mb-12">
            {t('languages.explore.title')}
          </h2>

          <div className="w-full overflow-hidden">
            <div ref={trackRef} className="flex w-full">
              {pages.map((page, pidx) => (
                <div key={pidx} className="flex-none w-full px-2">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {page.map((language, lidx) => (
                      <LanguageCard
                        key={language.name}
                        name={language.name}
                        flagSrc={language.flag}
                        speakers={language.speakers}
                        href={language.href}
                        index={lidx}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 w-full flex justify-center">
            <div className="flex items-center gap-2">
              {Array.from({ length: pagesCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-gray-900 w-8' : 'bg-gray-600 w-4'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
