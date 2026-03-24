import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import { languages } from './i18n-config';
import { OrganizationJsonLd, WebsiteJsonLd } from './components/seo/JsonLd';
import './globals.css';

const geistSans = Plus_Jakarta_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Plus_Jakarta_Sans({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lingo.com'),
  title: {
    template: '%s | Lingo',
    default: 'Lingo - Learn Languages Online with Native Speakers',
  },
  description: 'Master any language with Lingo. Learn from native speakers with interactive lessons, flexible scheduling, and personalized learning paths.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-pathname') || '/';
  
  const pathnameParts = pathname.split('/').filter(Boolean);
  const currentLang = pathnameParts[0];
  const lang = languages.includes(currentLang as typeof languages[number]) ? currentLang : 'en';

  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        {children}
      </body>
    </html>
  );
}
