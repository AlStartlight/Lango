'use client';

import LanguageFeaturesSection from '@/components/organisms/LanguageFeaturesSection';

const features = [
  {
    title: 'Native Speakers',
    description: 'Learn from certified native speakers who are passionate about teaching.',
  },
  {
    title: 'Flexible Schedule',
    description: 'Book lessons at any time that works for you, 24/7 availability.',
  },
  {
    title: 'Interactive Lessons',
    description: 'Engage in real conversations with AI-powered practice sessions.',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and feedback.',
  },
];

export default function LanguageFeatures() {
  return (
    <LanguageFeaturesSection
      heading="Why Learn With Us?"
      subheading="We provide the best tools and native speakers to help you achieve fluency faster."
      features={features}
      ctaHeading="Ready to Start Your Journey?"
      ctaButtonText="Get Started Free"
      ctaButtonColor="lime"
    />
  );
}
