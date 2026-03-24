'use client';

import { motion } from 'framer-motion';
import Button from '@/components/atomics/button';
import { useTranslation } from 'react-i18next';

export default function MapSection() {
  const { t } = useTranslation();
  
  return (
    <section className="w-full py-16 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden shadow-lg"
        >
          <div className="w-full h-[400px] bg-gray-200 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.086280870498!2d-122.41941708468216!3d37.77492977975892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our office location"
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Button href="#" text={t('about.map.getDirection')} color="blue" size="md" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
