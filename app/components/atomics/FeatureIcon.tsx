'use client';

import { motion } from 'framer-motion';

type FeatureIconProps = {
  icon: React.ReactNode;
  variant?: 'lime' | 'blue' | 'purple' | 'orange' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const variantClasses = {
  lime: 'bg-lime-300',
  blue: 'bg-blue-300',
  purple: 'bg-purple-300',
  orange: 'bg-orange-300',
  pink: 'bg-pink-300',
};

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export default function FeatureIcon({
  icon,
  variant = 'lime',
  size = 'md',
  className = '',
}: FeatureIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center ${className}`}
    >
      <span className={`text-black ${iconSizeClasses[size]}`}>{icon}</span>
    </motion.div>
  );
}
