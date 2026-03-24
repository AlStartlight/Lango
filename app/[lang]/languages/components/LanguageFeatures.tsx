'use client';

import { useTranslation } from 'react-i18next';
import LanguageFeaturesSection from '@/components/organisms/LanguageFeaturesSection';

const features = [
  {
    titleKey: 'languages.features.nativeSpeakers.title',
    descriptionKey: 'languages.features.nativeSpeakers.description',
  },
  {
    titleKey: 'languages.features.flexibleSchedule.title',
    descriptionKey: 'languages.features.flexibleSchedule.description',
  },
  {
    titleKey: 'languages.features.interactiveLessons.title',
    descriptionKey: 'languages.features.interactiveLessons.description',
  },
  {
    titleKey: 'languages.features.progressTracking.title',
    descriptionKey: 'languages.features.progressTracking.description',
  },
];

export default function LanguageFeatures() {
  const { t } = useTranslation();
  
  return (
    <LanguageFeaturesSection
      heading={t('languages.features.heading')}
      subheading={t('languages.features.subheading')}
      ctaHeading={t('languages.features.ctaHeading')}
      ctaButtonText={t('languages.features.ctaButton')}
      ctaButtonColor="lime"
      features={features.map(f => ({
        title: t(f.titleKey),
        description: t(f.descriptionKey),
      }))}
    />
  );
}
