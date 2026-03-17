'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
};

export default function AnimatedSection({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: AnimatedSectionProps) {
  const variants = {
    up: { initial: { opacity: 0, y: 50 }, whileInView: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: 50 }, whileInView: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 } },
  };

  const v = variants[direction];

  return (
    <motion.div
      initial={v.initial}
      whileInView={v.whileInView}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
