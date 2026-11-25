"use client";

import type { ReactNode } from "react";
import { LearningLocaleProvider } from "@/components/editor/learning-locale-context";
import { LearningI18nGate } from "@/components/editor/learning-i18n-gate";
import { ModuleProvider } from "@/components/editor/number-name/module-context";
import { GrammarProvider } from "@/components/editor/grammar/module-context";
import type { ContentLanguage, UiLocale } from "@/lib/i18n/locales";

/**
 * Client-only providers for the Survival & Trial training camp. The expedition
 * shell is a Server Component, so the interactive module state has to be
 * mounted below it, never around it.
 */
export function SurvivalWorkspaceProviders({
  locale,
  contentLanguage,
  targetLanguage,
  curriculumLevel,
  children,
}: {
  locale: UiLocale;
  contentLanguage: ContentLanguage;
  targetLanguage?: string | null;
  curriculumLevel?: string | null;
  children: ReactNode;
}) {
  return (
    <LearningLocaleProvider
      uiLocale={locale}
      contentLanguage={contentLanguage}
      targetLanguage={targetLanguage}
      curriculumLevel={curriculumLevel}
    >
      <ModuleProvider>
        <GrammarProvider>
          <LearningI18nGate locale={locale}>{children}</LearningI18nGate>
        </GrammarProvider>
      </ModuleProvider>
    </LearningLocaleProvider>
  );
}
