'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import Button from '@/components/atomics/button';
import { useTranslation } from 'react-i18next';

const blogPosts = [
  { title: '10 Tips to Learn a New Language Faster', category: 'Tips', image: '/images/explore/test1.png' },
  { title: 'How to Practice Speaking Daily', category: 'Practice', image: '/images/explore/test2.png' },
  { title: 'Top Language Learning Apps Reviewed', category: 'Tools', image: '/images/LangoLearn.png' },
  { title: 'The Role of Music in Language Learning', category: 'Culture', image: '/images/hero.png' },
  { title: 'Small Daily Habits that Help Fluency', category: 'Habits', image: '/images/ImagesPart.png' },
  { title: "Interview: A Polyglot's Routine", category: 'Interviews', image: '/images/speakers/Mask1.png' },
  { title: 'Grammar Tricks for Faster Progress', category: 'Grammar', image: '/images/speakers/Mask2.png' },
  { title: 'Pronunciation: Simple Drills', category: 'Pronunciation', image: '/images/speakers/Mask3.png' },
  { title: 'How Culture Shapes Meaning', category: 'Culture', image: '/images/speakers/Mask4.png' },
  { title: 'Best Books for Language Learners', category: 'Resources', image: '/images/explore/test1.png' },
  { title: 'Case Study: Immersion in 30 Days', category: 'Case Study', image: '/images/LangoLearn.png' },
  { title: 'Quick Tips: Remembering Vocabulary', category: 'Tips', image: '/images/hero.png' },
];

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function BlogSection() {
  const { t } = useTranslation();
  const perPage = 2;
  const pages = chunk(blogPosts, perPage);
  const pagesCount = pages.length;
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = 'transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)';
    track.style.transform = `translateX(-${active * 100}%)`;
  }, [active]);

  return (
    <section className="w-full py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ChopThumbnail bgcolor="blue" textcolor="white" textsize="xxxlarge" nospace>
              {t('howItWorks.blog.title')}
            </ChopThumbnail>
          </div>
          <p className="text-gray-600 text-lg mt-4">{t('howItWorks.blog.subtitle')}</p>
        </motion.div>

        <div className="relative">
          <div className="w-full overflow-hidden">
            <div ref={trackRef} className="flex w-full">
              {pages.map((page, pidx) => (
                <div key={pidx} className="flex-none w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {page.map((post) => (
                      <motion.div
                        key={post.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                            {post.category}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mt-2 mb-4">
                            {post.title}
                          </h3>
                          <Button href="#" text={t('common.readMore')} color="blue" size="sm" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setActive((a) => Math.max(0, a - 1))}
              disabled={active === 0}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <Image src="/images/icons/left.png" alt="Previous" width={16} height={16} style={{ filter: 'invert(100%)' }} />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pagesCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActive((a) => Math.min(pagesCount - 1, a + 1))}
              disabled={active === pagesCount - 1}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <Image src="/images/icons/right.png" alt="Next" width={16} height={16} style={{ filter: 'invert(100%)' }}/>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
