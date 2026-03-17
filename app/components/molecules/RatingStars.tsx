'use client';

type RatingStarsProps = {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
};

export default function RatingStars({ rating, maxStars = 5, size = 'md' }: RatingStarsProps) {
  const sizeClasses = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  
  return (
    <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}
