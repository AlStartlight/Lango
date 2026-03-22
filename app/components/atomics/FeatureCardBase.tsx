'use client';

type FeatureCardBaseProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  variant?: 'lime' | 'blue' | 'purple' | 'orange' | 'pink';
};

const bgVariants = {
  lime: 'bg-lime-100',
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  orange: 'bg-orange-100',
  pink: 'bg-pink-100',
};

export default function FeatureCardBase({
  title,
  description,
  icon,
  className = '',
  variant = 'lime',
}: FeatureCardBaseProps) {
  return (
    <div className={`${bgVariants[variant]} rounded-3xl p-6 ${className}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
      <p className="text-black/70 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
