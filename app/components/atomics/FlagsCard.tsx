'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type FlagsCardProps = {
  country: string;
  flag: string;
  href: string;
  className?: string;
  index?: number;
};

function FlagsCard({ country, flag, href, className = "", index = 0 }: FlagsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.03 }}
    >
      <Link
        href={href}
        className={`flex flex-col bg-white w-full h-[160px] items-center justify-center gap-2 border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300 ${className}`}
      >
        <Image
          src={flag}
          alt={`${country} flag`}
          width={64}
          height={64}
          className="object-contain rounded-sm"
        />
        <span className="text-sm font-semibold text-gray-700">{country}</span>
      </Link>
    </motion.div>
  );
}

export default FlagsCard;