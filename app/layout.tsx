import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import { ClerkProvider } from '@clerk/nextjs';
import { languages } from './i18n-config';
import { OrganizationJsonLd, WebsiteJsonLd } from './components/seo/JsonLd';
import ClientProviders from './components/providers/ClientProviders';
import { isClerkConfigured } from './lib/clerk';
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
  metadataBase: new URL('https://lango.com'),
  title: {
    template: '%s | Lango',
    default: 'Lango - Learn Languages Online with Native Speakers',
  },
  description: 'Master any language with Lango. Learn from native speakers with interactive lessons, flexible scheduling, and personalized learning paths.',
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

  const clerkConfigured = isClerkConfigured();

  const content = (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );

  if (!clerkConfigured) {
    return content;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ff6b35",
          colorForeground: "#1a1714",
          colorMutedForeground: "#4a4640",
          colorBackground: "#ffffff",
          colorInputForeground: "#1a1714",
          colorInput: "#f9f7f4",
          borderRadius: "0.75rem",
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontSize: "1rem",
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
