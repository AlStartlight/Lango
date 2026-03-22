'use client';

import { motion } from 'framer-motion';
import SectionHeading from '../atomics/SectionHeading';
import FeaturesGrid from '../molecules/FeaturesGrid';
import CTASection from '../atomics/CTASection';

type Feature = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'lime' | 'blue' | 'purple' | 'orange' | 'pink';
};

type LanguageFeaturesSectionProps = {
  heading?: string;
  subheading?: string;
  features: Feature[];
  ctaHeading?: string;
  ctaButtonText?: string;
  ctaButtonColor?: string;
  ctaButtonHref?: string;
  className?: string;
};

export default function LanguageFeaturesSection({
  heading = 'Why Learn With Us?',
  subheading = 'We provide the best tools and native speakers to help you achieve fluency faster.',
  features,
  ctaHeading = 'Ready to Start Your Journey?',
  ctaButtonText = 'Get Started Free',
  ctaButtonColor = 'lime',
  ctaButtonHref,
  className = '',
}: LanguageFeaturesSectionProps) {
  return (
    <section className={`w-full py-16 md:py-24 px-6 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <SectionHeading align="center">{heading}</SectionHeading>
          {subheading && (
            <p className="text-black/60 text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              {subheading}
            </p>
          )}
        </motion.div>

        {/* Features Grid */}
        <FeaturesGrid features={features} />

        {/* CTA Section */}
        <div className="mt-16 md:mt-44">
          <CTASection
            heading={ctaHeading}
            buttonText={ctaButtonText}
            buttonColor={ctaButtonColor}
            buttonHref={ctaButtonHref}
          />
        </div>
      </div>
    </section>
  );
}
