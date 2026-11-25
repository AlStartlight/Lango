import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import I18nProvider from '@/components/I18nProvider';
import { languages, type Language } from '@/i18n-config';
import { toHtmlLang } from '@/lib/i18n/locales';

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
  id: "id_ID",
  jp: "ja_JP",
  hi: "hi_IN",
  de: "de_DE",
  ar: "ar_AR",
  fr: "fr_FR",
  pt: "pt_BR",
  it: "it_IT",
  nl: "nl_NL",
  ko: "ko_KR",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const languagesAlternates = Object.fromEntries(
    languages.map((entry) => [toHtmlLang(entry), `/${entry}`]),
  );

  return {
    alternates: {
      canonical: `/${lang}`,
      languages: { ...languagesAlternates, "x-default": "/en" },
    },
    openGraph: {
      locale: OG_LOCALES[lang] ?? "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!languages.includes(lang as Language)) {
    notFound();
  }

  return (
    <I18nProvider locale={lang}>{children}</I18nProvider>
  );
}
