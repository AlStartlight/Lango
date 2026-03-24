'use client';

import { motion } from 'framer-motion';
import { ChopThumbnail } from '@/components/atomics/ChopThumbnail';
import Input from '@/components/atomics/Input';
import Button from '@/components/atomics/button';
import { useTranslation } from 'react-i18next';

export default function Newsletter() {
  const { t } = useTranslation();
  
  return (
    <section className="w-full py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {t('newsletter.title')}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('newsletter.subtitle')}</h2>
          <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
            {t('newsletter.update')}
          </ChopThumbnail>
        </div>

        <div className="mt-8 space-y-3">
          <Input placeholder={t('newsletter.placeholder')} type="email" variant="dark"/>
          <Button
            text={t('newsletter.button')}
            color="blue"
            className="w-full"
            size="lg"
          />
        </div>
      </motion.div>
    </section>
  );
}
