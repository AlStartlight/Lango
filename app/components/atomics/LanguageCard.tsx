'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type LanguageCardProps = {
  name: string;
  flagSrc: string;
  speakers: string;
  className?: string;
};

export default function LanguageCard({ name, flagSrc, speakers, className = '' }: LanguageCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${className}`}
    >
      <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-lime-300">
        <Image
          src={flagSrc}
          alt={`${name} flag`}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="text-xl font-bold text-center text-black mb-2">{name}</h3>
      <p className="text-black/60 text-sm text-center">{speakers} speakers</p>
    </motion.div>
  );
}
