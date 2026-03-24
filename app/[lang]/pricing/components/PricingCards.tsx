'use client';

import { motion } from 'framer-motion';
import PriceCard from '@/components/atomics/PriceCard';
import SectionHeading from '@/components/atomics/SectionHeading';
import { useTranslation } from 'react-i18next';

export default function PricingCards() {
  const { t } = useTranslation();
  
  const pricingPlans = [
    {
      tier: t('pricing.cards.free.tier'),
      price: t('pricing.cards.free.price'),
      period: t('pricing.cards.free.period'),
      features: t('pricing.cards.free.features', { returnObjects: true }) as unknown as string[],
      popular: false,
    },
    {
      tier: t('pricing.cards.pro.tier'),
      price: t('pricing.cards.pro.price'),
      period: t('pricing.cards.pro.period'),
      features: t('pricing.cards.pro.features', { returnObjects: true }) as unknown as string[],
      popular: true,
    },
    {
      tier: t('pricing.cards.team.tier'),
      price: t('pricing.cards.team.price'),
      period: t('pricing.cards.team.period'),
      features: t('pricing.cards.team.features', { returnObjects: true }) as unknown as string[],
      popular: false,
    },
  ];

  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeading align="center">{t('pricing.cards.title')}</SectionHeading>
          <p className="text-black/60 text-lg mt-4 max-w-2xl mx-auto">
            {t('pricing.cards.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <PriceCard
                tier={plan.tier}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                popular={plan.popular}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:mt-16 bg-lime-100 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-black mb-4">{t('pricing.cards.enterprise.title')}</h3>
          <p className="text-black/70 mb-6">
            {t('pricing.cards.enterprise.description')}
          </p>
          <a href="mailto:enterprise@langolearn.com" className="text-lime-600 font-semibold hover:underline">
            {t('pricing.cards.enterprise.cta')} &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}
