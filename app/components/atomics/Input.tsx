'use client';

type InputProps = {
  placeholder?: string;
  type?: string;
  className?: string;
  variant?: 'light' | 'dark';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
};

export default function Input({
  placeholder = '',
  type = 'text',
  className = '',
  variant = 'light',
  value,
  onChange,
  name,
}: InputProps) {
  const colorClasses =
    variant === 'dark'
      ? 'bg-black text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-600'
      : 'bg-white text-gray-900 placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-200';

  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-6 py-4 rounded-full border-2 border-gray-800 ${colorClasses} focus:outline-none transition-all duration-300 ${className}`}
    />
  );
}
