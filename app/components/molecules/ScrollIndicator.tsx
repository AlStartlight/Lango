'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ScrollIndicator() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="flex items-center gap-2 cursor-pointer group"
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
    >
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="w-8 h-12 rounded-full border-2 border-gray-800 flex items-start justify-center p-2"
      >
        <ChevronDown className="w-4 h-4 text-gray-800" />
      </motion.div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        {t('common.scrollDown')}
      </span>
    </motion.div>
  );
}
