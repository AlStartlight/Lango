import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { languages } from "./i18n-config";
import { toHtmlLang, toScript, toTextDirection } from "./lib/i18n/locales";
import { OrganizationJsonLd, WebsiteJsonLd } from "./components/seo/JsonLd";
import ClientProviders from "./components/providers/ClientProviders";
import "./globals.css";

const geistSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Plus_Jakarta_Sans({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lango.com"),
  title: {
    template: "%s | Lango",
    default: "Lango - Learn Languages Online",
  },
  description:
    "Belajar bahasa dengan latihan singkat, penjelasan langsung, dan progres yang tersimpan.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const requestLocale = headersList.get("x-lango-locale") ?? "en";
  const lang = languages.includes(requestLocale as (typeof languages)[number])
    ? requestLocale
    : "en";

  const dir = toTextDirection(lang);
  const script = toScript(lang);

  return (
    <html lang={toHtmlLang(lang)} dir={dir} data-script={script}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} script-${script} antialiased`}
        suppressHydrationWarning
      >
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
