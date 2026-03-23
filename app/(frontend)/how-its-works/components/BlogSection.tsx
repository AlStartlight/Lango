'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import Button from '@/components/atomics/button';

const blogPosts = [
  { title: '10 Tips to Learn a New Language Faster', category: 'Tips', image: '/images/explore/test1.png', slug: '10-tips-to-learn-a-new-language-faster' },
  { title: 'How to Practice Speaking Daily', category: 'Practice', image: '/images/explore/test2.png', slug: 'how-to-practice-speaking-daily' },
  { title: 'Top Language Learning Apps Reviewed', category: 'Tools', image: '/images/LangoLearn.png', slug: 'top-language-learning-apps-reviewed' },
  { title: 'The Role of Music in Language Learning', category: 'Culture', image: '/images/hero.png', slug: 'the-role-of-music-in-language-learning' },
  { title: 'Small Daily Habits that Help Fluency', category: 'Habits', image: '/images/ImagesPart.png', slug: 'small-daily-habits-that-help-fluency' },
  { title: 'Interview: A Polyglot’s Routine', category: 'Interviews', image: '/images/speakers/Mask1.png', slug: 'interview-a-polyglots-routine' },
  { title: 'Grammar Tricks for Faster Progress', category: 'Grammar', image: '/images/speakers/Mask2.png', slug: 'grammar-tricks-for-faster-progress' },
  { title: 'Pronunciation: Simple Drills', category: 'Pronunciation', image: '/images/speakers/Mask3.png', slug: 'pronunciation-simple-drills' },
  { title: 'How Culture Shapes Meaning', category: 'Culture', image: '/images/speakers/Mask4.png', slug: 'how-culture-shapes-meaning' },
  { title: 'Best Books for Language Learners', category: 'Resources', image: '/images/explore/test1.png', slug: 'best-books-for-language-learners' },
  { title: 'Case Study: Immersion in 30 Days', category: 'Case Study', image: '/images/LangoLearn.png', slug: 'case-study-immersion-in-30-days' },
  { title: 'Quick Tips: Remembering Vocabulary', category: 'Tips', image: '/images/hero.png', slug: 'quick-tips-remembering-vocabulary' },
];

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
export default function BlogSection() {
  const router = useRouter();

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
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

  const prev = () => setActive((s) => (pagesCount ? (s - 1 + pagesCount) % pagesCount : 0));
  const next = () => setActive((s) => (pagesCount ? (s + 1) % pagesCount : 0));

  return (
    <section className="w-full py-20 px-4 border-b border-gray-800/10 bg-blue-400">
      <div className="max-w-7xl mx-auto">
        <div className='flex flex-row justify-between'>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:text-start text-center  mb-12"
          >
            <div className="flex flex-wrap items-center justify-center md:items-start md:justify-start gap-2">
              <ChopThumbnail bgcolor="transparent" textcolor="white" textsize="xxxlarge" nospace>
                Explore
              </ChopThumbnail>
              <span className="text-3xl md:text-4xl font-bold text-white"> The Latest From</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:items-start md:justify-start gap-2 mt-2">
              <span className="text-3xl md:text-4xl font-bold text-white">Our</span>
              <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
                Blog
              </ChopThumbnail>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="  mb-12"
          >
            {/* Nav Arrows */}
            <div className="relative my-20 -bottom-28 right-32 md:bottom-0 md:right-0">
              <div className="absolute right-0 -top-10 flex items-center gap-3 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous speakers"
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-gray-300 bg-transparent flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <Image src="/images/icons/left.png" alt="Previous" width={16} height={16} style={{ filter: 'invert(100%)' }} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next speakers"
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-white text-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                >
                        <Image src="/images/icons/right.png" alt="Next" width={16} height={16} style={{ filter: 'invert(100%)' }}/>
                </motion.button>
              </div>
            </div>

          </motion.div>
        </div>

        <div className="overflow-hidden w-full mt-6">
          <div ref={trackRef} className="flex w-full">
            {pages.map((page, pidx) => (
              <div key={pidx} className="flex-none w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {page.map((post, i) => {
                    const slug = (post as any).slug ?? slugify(post.title);
                    return (
                      <motion.div
                        key={post.title + i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.15 }}
                        whileHover={{ y: -5 }}
                        className={`${i % 2 == 0 ? 'bg-lime-300' : 'bg-gray-100'} rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer`}
                      >
                        <div className={`h-96 ${i % 2 == 0 ? 'bg-lime-300' : 'bg-gray-100'} relative overflow-hidden`}>
                          <Image
                            src={post.image}
                            alt={post.title}
                            width={809}
                            height={627}
                            sizes="(min-width: 768px) 50vw, 100vw"
                            priority={i === 0 && pidx === 0}
                            fetchPriority={i === 0 && pidx === 0 ? 'high' : undefined}
                            className="w-full h-full object-contain opacity-80 rounded-[5rem] p-10"
                          />
                        </div>
                        <div className="p-6 flex flex-row justify-between">
                      <div>

                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {post.category}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mt-2 leading-snug">{post.title}</h3>
                      </div>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            aria-label={`Open ${post.title}`}
                            onClick={() => router.push(`/blog/${post.slug}`)}
                            className="mt-4 w-10 h-10 rounded-full bg-white text-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                          >
                            <Image src="/images/icons/right.png" alt="Open post" width={16} height={16} style={{ filter: 'invert(100%)' }} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {/* <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-current={i === active}
                className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-white w-8' : 'bg-gray-200 w-4'}`}
              />
            ))}
          </div>
        </div> */}

        <div className="flex justify-center mt-10">
          <Button href="/blog" text="Read All" color="white" size="md" />
        </div>
      </div>
    </section>
  );
}
