'use client';

import { motion } from 'framer-motion';
import RatingStars from './RatingStars';

type RatingBadgeProps = {
  score: string;
  source: string;
  stars: number;
  index?: number;
};

export default function RatingBadge({ score, source, stars, index = 0 }: RatingBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex flex-col items-start"
    >
      <span className="text-5xl md:text-6xl font-bold text-gray-900">{score}</span>
      <RatingStars rating={stars} size="md" />
      <span className="text-sm text-gray-500 mt-1">{source}</span>
    </motion.div>
  );
}
