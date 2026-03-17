'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import Badge from '../../components/atomics/Badge';

const miniTestimonials = [
  {
    name: 'Jana Root',
    img: '/images/speakers/Mask1.png',
    langs: [
      { name: 'English', color: 'green' as const },
      { name: 'German', color: 'pink' as const },
    ],
    review: 'This is Langen Tips. I use it daily to practice my German and English conversational skills.',
  },
  {
    name: 'Vinod Koshi',
    img: '/images/speakers/Mask2.png',
    langs: [
      { name: 'Hindi', color: 'orange' as const },
      { name: 'English', color: 'green' as const },
    ],
    review: 'Ive been learning languages for 6 months. The progress is amazing with native speakers.',
  },
  {
    name: 'Hasan Mehmud',
    img: '/images/speakers/Mask3.png',
    langs: [
      { name: 'Arabic', color: 'blue' as const },
      { name: 'German', color: 'purple' as const },
    ],
    review: 'The platform makes Arabic learning intuitive. I can see real progress every single week now.',
  },
];

export default function LovedByLearners() {
  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl md:text-4xl font-bold">Loved by</span>
            <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
              learners
            </ChopThumbnail>
            <span className="text-3xl md:text-4xl font-bold">,</span>
          </div>
          <span className="text-3xl md:text-4xl font-light">supported by experts</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {miniTestimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image src={t.img} alt={t.name} width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-gray-900">{t.name}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {t.langs.map((l) => (
                  <Badge key={l.name} text={l.name} color={l.color} />
                ))}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{t.review}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
