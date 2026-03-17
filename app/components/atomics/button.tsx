'use client';
import Link from "next/link";
import { motion } from "framer-motion";

const ColorRecord: Record<string, string> = {
  black: "bg-black text-white",
  white: "bg-white text-black",
  blue: "bg-blue-600 text-white",
  green: "bg-green-600 text-white",
  yellow: "bg-yellow-500 text-black",
  purple: "bg-purple-600 text-white",
  pink: "bg-pink-600 text-white",
  red: "bg-red-500 text-white",
  lime: "bg-lime-400 text-black",
  fuchsia: "bg-fuchsia-500 text-white",
};

type ButtonProps = {
  text: string;
  href?: string;
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
  onClick?: () => void;
  type?: 'button' | 'submit';
};

export default function Button({
  text,
  href,
  className = '',
  color = 'black',
  size = 'md',
  variant = 'solid',
  onClick,
  type = 'button',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-12 py-4 text-lg',
  };

  const baseClasses = `font-semibold rounded-full transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer`;
  const variantClasses =
    variant === 'outline'
      ? `border-2 border-current bg-transparent hover:opacity-80`
      : `${ColorRecord[color] || ColorRecord.black} hover:shadow-lg hover:scale-105 active:scale-95`;

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`;

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <Link href={href} className={combinedClasses}>
          {text}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={combinedClasses}
      onClick={onClick}
      type={type}
    >
      {text}
    </motion.button>
  );
}