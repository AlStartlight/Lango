'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const footerLinks = {
  Lingo: [
    { label: 'About us', href: '/aboutus' },
    { label: 'Careers', href: '#' },
    { label: 'Brand Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Products: [
    { label: 'Lingo', href: '#' },
    { label: 'Lingo for Business', href: '#' },
    { label: 'Lingo App', href: '#' },
    { label: 'Lingo AR', href: '#' },
  ],
  Support: [
    { label: 'Contact', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Advertise Program', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800/20 pt-12 pb-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <Link href="/" className="inline-block">
              <Image src="/Logo.png" alt="Lingo Logo" width={82} height={32} />
            </Link>
            <div className="flex items-center gap-3 mt-4">
              <SocialIcon icon="instagram" />
              <SocialIcon icon="youtube" />
              <SocialIcon icon="twitter" />
              <SocialIcon icon="facebook" />
            </div>
            <p className="text-sm text-gray-600 mt-4 max-w-xs">
              Learning languages doesn&apos;t need to be complicated. 
              Our mission is to make language learning accessible to everyone.
            </p>
          </motion.div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links], colIdx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (colIdx + 1) * 0.1 }}
            >
              <h4 className="font-bold text-gray-900 mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/10 text-center">
          <p className="text-sm text-gray-500">
            © copyright LINGO 2024. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  const icons: Record<string, string> = {
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  };

  return (
    <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition-colors duration-200">
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d={icons[icon]} />
      </svg>
    </a>
  );
}
