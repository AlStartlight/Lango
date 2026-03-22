'use client';

import { motion } from 'framer-motion';
import PriceCard from '../../components/atomics/PriceCard';
import SectionHeading from '../../components/atomics/SectionHeading';

const pricingPlans = [
  {
    tier: 'Free',
    price: '$0',
    period: '/mo',
    features: [
      'Access to 5 languages',
      '10 practice sessions/month',
      'Basic vocabulary cards',
      'Community forum access',
      'Email support',
    ],
    popular: false,
  },
  {
    tier: 'Pro',
    price: '$9.99',
    period: '/mo',
    features: [
      'Access to all 10+ languages',
      'Unlimited practice sessions',
      'Advanced vocabulary cards',
      'Native speaker chat',
      'Priority email support',
      'Progress analytics',
      'Offline mode',
    ],
    popular: true,
  },
  {
    tier: 'Team',
    price: '$19.99',
    period: '/mo',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared progress dashboard',
      'Admin management panel',
      'Dedicated account manager',
      'Custom learning paths',
      'API access',
    ],
    popular: false,
  },
];

export default function PricingCards() {
  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeading align="center">Choose Your Plan</SectionHeading>
          <p className="text-black/60 text-lg mt-4 max-w-2xl mx-auto">
            Start for free and upgrade when you&apos;re ready. All plans include our core learning features.
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
          className="text-center mt-16 bg-lime-100 rounded-3xl p-8 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-black mb-4">Need a Custom Solution?</h3>
          <p className="text-black/70 mb-6">
            We offer enterprise plans for organizations with specific requirements. Contact us for a tailored solution.
          </p>
          <a href="mailto:enterprise@langolearn.com" className="text-lime-600 font-semibold hover:underline">
            Contact Sales Team &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}
