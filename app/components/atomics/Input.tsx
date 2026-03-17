'use client';

type InputProps = {
  placeholder?: string;
  type?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
};

export default function Input({
  placeholder = '',
  type = 'text',
  className = '',
  value,
  onChange,
  name,
}: InputProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-6 py-4 rounded-full border-2 border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200 transition-all duration-300 ${className}`}
    />
  );
}
