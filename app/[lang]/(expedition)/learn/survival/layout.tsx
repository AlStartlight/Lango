import type { ReactNode } from "react";
import { requireLearner } from "@/lib/auth/guards";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { SurvivalWorkspaceProviders } from "@/components/editor/survival-providers";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SurvivalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const user = await requireLearner(lang, `/${lang}/learn/survival`);
  const uiLocale = isUiLocale(lang) ? lang : "en";

  return (
    <SurvivalWorkspaceProviders
      locale={uiLocale}
      contentLanguage={resolveContentLanguage(user.targetLanguage, uiLocale)}
      targetLanguage={user.targetLanguage}
      curriculumLevel={user.curriculumLevel}
    >
      {children}
    </SurvivalWorkspaceProviders>
  );
}
