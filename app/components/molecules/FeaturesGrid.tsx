'use client';

import FeatureCard from './FeatureCard';

type Feature = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'lime' | 'blue' | 'purple' | 'orange' | 'pink';
};

type FeaturesGridProps = {
  features: Feature[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
};

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
} as const;

export default function FeaturesGrid({
  features,
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  className = '',
}: FeaturesGridProps) {
  const mobile = columnClasses[columns.mobile as keyof typeof columnClasses] || columnClasses[1];
  const tablet = columnClasses[columns.tablet as keyof typeof columnClasses] || columnClasses[2];
  const desktop = columnClasses[columns.desktop as keyof typeof columnClasses] || columnClasses[4];

  return (
    <div className={`grid ${mobile} sm:${mobile} md:${tablet} lg:${desktop} gap-6 md:gap-8 ${className}`}>
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          index={index}
        />
      ))}
    </div>
  );
}
