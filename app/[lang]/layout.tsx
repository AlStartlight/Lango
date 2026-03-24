import { notFound } from 'next/navigation';
import I18nProvider from '@/components/I18nProvider';
import { languages, type Language } from '@/i18n-config';

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
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
