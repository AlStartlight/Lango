'use client';

type BadgeProps = {
  text: string;
  color?: 'green' | 'blue' | 'pink' | 'orange' | 'purple' | 'lime';
  size?: 'sm' | 'md';
  icon?: string;
};

const colorMap: Record<string, string> = {
  green: 'bg-green-100 text-green-700 border-green-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  lime: 'bg-lime-100 text-lime-700 border-lime-200',
};

export default function Badge({ text, color = 'green', size = 'sm', icon }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-3 py-1' : 'text-sm px-4 py-1.5';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorMap[color]} ${sizeClasses}`}>
      {icon && <span>{icon}</span>}
      {text}
    </span>
  );
}
