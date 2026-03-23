'use client';

import { motion } from 'framer-motion';
import Button from './button';

type PriceCardProps = {
  tier: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
  className?: string;
};

export default function PriceCard({ tier, price, period = '/mo', features, popular = false, className = '' }: PriceCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg transition-shadow ${
        popular ? 'ring-4 ring-lime-400 shadow-xl md:scale-105' : ''
      } ${className}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-400 text-black font-bold px-4 py-1 rounded-full text-sm">
          Most Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-black mb-2">{tier}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl md:text-5xl font-extrabold text-black">{price}</span>
          <span className="text-black/60">{period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-black/80">
            <svg className="w-5 h-5 text-lime-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        text={popular ? 'Get Started' : 'Choose Plan'}
        variant={popular ? 'solid' : 'outline'}
        color={popular ? 'lime' : 'black'}
        className="w-full"
        size="lg"
      />
    </motion.div>
  );
}
