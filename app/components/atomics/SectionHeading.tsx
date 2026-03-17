'use client';

type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
};

export default function SectionHeading({ children, className = '', align = 'left' }: SectionHeadingProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  return (
    <h2 className={`text-4xl md:text-5xl font-bold tracking-tight leading-tight ${alignClass[align]} ${className}`}>
      {children}
    </h2>
  );
}
