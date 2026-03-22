'use client';

import { motion } from 'framer-motion';
import Button from './button';

type CTASectionProps = {
  heading: string;
  buttonText: string;
  buttonColor?: string;
  buttonHref?: string;
  className?: string;
};

export default function CTASection({
  heading,
  buttonText,
  buttonColor = 'lime',
  buttonHref,
  className = '',
}: CTASectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`text-center ${className}`}
    >
      <h3 className="text-2xl md:text-3xl font-bold text-black mb-6">{heading}</h3>
      <Button text={buttonText} color={buttonColor} size="lg" href={buttonHref} />
    </motion.div>
  );
}
