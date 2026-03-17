'use client';

import { motion } from 'framer-motion';
import Badge from '../atomics/Badge';

type TestimonialCardProps = {
  name: string;
  languages: { name: string; color: 'green' | 'blue' | 'pink' | 'orange' | 'purple' | 'lime' }[];
  review: string;
  index?: number;
};

export default function TestimonialCard({ name, languages, review, index = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <h4 className="font-bold text-lg text-gray-900">{name}</h4>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {languages.map((lang) => (
          <Badge key={lang.name} text={lang.name} color={lang.color} />
        ))}
      </div>
      <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-4">{review}</p>
    </motion.div>
  );
}
