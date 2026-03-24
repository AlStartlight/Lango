'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TestimonialCard from '@/components/molecules/TestimonialCard';
import Button from '@/components/atomics/button';

type LangColor = 'green' | 'blue' | 'pink' | 'orange' | 'purple' | 'lime';

const testimonials = [
  {
    name: 'Jana Root',
    languages: [
      { name: 'English', color: 'green' as LangColor },
      { name: 'German', color: 'pink' as LangColor },
    ],
    review: 'This is Langen Tips. I use it daily to practice my German and English. The personalized learning paths make it incredibly effective. I have recommended it to all my friends.',
  },
  {
    name: 'Vinod Koshi',
    languages: [
      { name: 'Hindi', color: 'orange' as LangColor },
      { name: 'English', color: 'green' as LangColor },
    ],
    review: 'Ive been learning Hindi for 6 months and the progress is amazing. The native speakers are patient and helpful. The lessons are well structured and engaging.',
  },
  {
    name: 'Hasan Mehmud',
    languages: [
      { name: 'Arabic', color: 'blue' as LangColor },
      { name: 'German', color: 'purple' as LangColor },
    ],
    review: 'This is Langen Tips. I use it daily to practice my Arabic. The conversational approach helps me learn faster than any textbook method I have tried before.',
  },
  {
    name: 'Rohit Sharma',
    languages: [
      { name: 'Hindi', color: 'orange' as LangColor },
      { name: 'Portuguese', color: 'lime' as LangColor },
    ],
    review: 'This is Brilliant! Tips. I use it daily to learn multiple languages. The voice recognition is incredibly accurate and helps me improve pronunciation rapidly.',
  },
  {
    name: 'Tamim Iqbal',
    languages: [
      { name: 'Bangla', color: 'green' as LangColor },
      { name: 'English', color: 'blue' as LangColor },
    ],
    review: 'The platform is incredibly intuitive. I love how it adapts to my learning style. The weekly progress reports keep me motivated to continue learning every day.',
  },
  {
    name: 'Sarah Taylor',
    languages: [
      { name: 'English', color: 'green' as LangColor },
      { name: 'French', color: 'pink' as LangColor },
    ],
    review: 'This is Langen Tips. The native tutors are amazing and very patient. I have learned more French in 3 months than in 2 years of traditional classes.',
  },
  {
    name: 'Ricky Ponting',
    languages: [
      { name: 'English', color: 'green' as LangColor },
      { name: 'Italian', color: 'orange' as LangColor },
    ],
    review: 'The language tutors are well curated. I can learn Italian while traveling. The offline mode is a game changer for people who travel frequently like me.',
  },
  {
    name: 'Adam Gilchrist',
    languages: [
      { name: 'English', color: 'green' as LangColor },
      { name: 'Spanish', color: 'purple' as LangColor },
    ],
    review: 'Incredible platform for language learners. The gamification features keep me engaged. I ve achieved fluency in Spanish faster than I thought possible.',
  },
  {
    name: 'Jason Mehmud',
    languages: [
      { name: 'Hindi', color: 'orange' as LangColor },
      { name: 'Arabic', color: 'blue' as LangColor },
    ],
    review: 'This is Langen Tips. Learning Arabic has never been easier. The cultural context provided with each lesson makes language learning meaningful and enjoyable.',
  },
  {
    name: 'Jason Holder',
    languages: [
      { name: 'English', color: 'green' as LangColor },
      { name: 'German', color: 'pink' as LangColor },
    ],
    review: 'Great platform for international language learning. The interactive exercises are fun and challenging. I use it daily and can see real improvement in my skills.',
  },
  {
    name: 'Joshun Kieshan',
    languages: [
      { name: 'Bangla', color: 'green' as LangColor },
      { name: 'French', color: 'purple' as LangColor },
    ],
    review: 'The best language learning app I have ever used. The AI-powered suggestions are spot on. The community features allow me to practice with other learners too.',
  },
  {
    name: 'Kyle Mills',
    languages: [
      { name: 'English', color: 'green' as LangColor },
      { name: 'French', color: 'blue' as LangColor },
    ],
    review: 'I highly recommend this platform. The lessons are well structured and the tutors are excellent. Learning French has become a daily habit I actually enjoy.',
  },
  {
    name: 'Munim Shahriar',
    languages: [
      { name: 'Bangla', color: 'green' as LangColor },
      { name: 'English', color: 'blue' as LangColor },
    ],
    review: 'Incredible learning experience. The progress tracking is detailed and motivating. I can see exactly where I need to improve and focus my efforts accordingly.',
  },
  {
    name: 'Nozmul Shanto',
    languages: [
      { name: 'Hindi', color: 'orange' as LangColor },
      { name: 'English', color: 'green' as LangColor },
    ],
    review: 'Simple to use but very effective. The speaking exercises with AI feedback are incredible. I feel more confident in my English conversations every single week.',
  },
  {
    name: 'Faizan Allen',
    languages: [
      { name: 'Sanskrit', color: 'purple' as LangColor },
      { name: 'English', color: 'green' as LangColor },
    ],
    review: 'The cultural immersion approach is brilliant. Learning Sanskrit with historical context has been a unique and enriching experience that I treasure greatly.',
  },
];

export default function TestimonialsGrid() {
  const [visibleCount, setVisibleCount] = useState(12);
  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const hasMore = visibleCount < testimonials.length;

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTestimonials.map((t, idx) => (
            <TestimonialCard
              key={t.name}
              name={t.name}
              languages={t.languages}
              review={t.review}
              index={idx}
            />
          ))}
        </div>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-10"
          >
            <Button
              text="Load More"
              color="green"
              size="md"
              onClick={() => setVisibleCount((c) => c + 6)}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
