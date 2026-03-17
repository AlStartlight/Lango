'use client';

import { motion } from 'framer-motion';

const bgColors: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-600",
  yellow: "bg-yellow-400",
  purple: "bg-purple-600",
  fuchia: "bg-fuchsia-300",
  red: "bg-red-500",
  indigo: "bg-indigo-600",
  transparent: "bg-transparent",
  black: "bg-black",
  lime: "bg-lime-300",
};

const textColors: Record<string, string> = {
  white: "text-white",
  black: "text-black",
  blue: "text-blue-600",
  green: "text-green-600",
  yellow: "text-yellow-600",
  purple: "text-purple-600",
  pink: "text-pink-600",
  red: "text-red-600",
};

const textSize: Record<string, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
  xxlarge: "text-2xl",
  xxxlarge: "text-3xl",
  huge: "text-4xl",
  xtrahuge: "text-5xl",
  xxtrahuge: "text-6xl",
  mega: "text-7xl",
};

type ChopThumbnailProps = {
  children: string;
  bgcolor: string;
  textcolor: string;
  textsize: string;
  nospace?: boolean;
  className?: string;
  animated?: boolean;
};

export function ChopThumbnail({
  children,
  bgcolor,
  textcolor,
  textsize,
  nospace = false,
  className = '',
  animated = false,
}: ChopThumbnailProps) {
  const wrapperClass = `border-2 border-gray-800/20 rounded-full justify-center items-center flex ${bgColors[bgcolor] || "bg-blue-600"} ${className}`;

  const inner = (
    <h1
      className={`${textColors[textcolor] || "text-black"} ${textSize[textsize] || "text-base"} tracking-tight ${
        nospace ? 'p-1 px-2 font-extrabold' : 'p-4 px-8 font-extrabold'
      }`}
    >
      {children}
    </h1>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' as const }}
        className={wrapperClass}
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <div className={wrapperClass}>
      {inner}
    </div>
  );
}