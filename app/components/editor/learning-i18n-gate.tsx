"use client";

import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type { UiLocale } from "@/lib/i18n/locales";

/**
 * The shared i18n instance starts in English. Show a language-neutral skeleton
 * for the first frame instead of flashing English on /id or /jp.
 */
export function LearningI18nGate({
  locale,
  children,
}: {
  locale: UiLocale;
  children: ReactNode;
}) {
  const { i18n } = useTranslation();

  if (i18n.language !== locale) {
    return (
      <div className="min-h-screen bg-exp-surface" aria-busy="true" aria-live="polite">
        <div className="mx-auto w-full max-w-[1400px] space-y-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="h-36 animate-pulse rounded-3xl bg-exp-container-high sm:h-44" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-2xl bg-exp-surface-low sm:col-span-2" />
            <div className="h-28 animate-pulse rounded-2xl bg-exp-surface-low" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-36 animate-pulse rounded-2xl bg-exp-surface-low" />
            <div className="h-36 animate-pulse rounded-2xl bg-exp-surface-low" />
            <div className="h-36 animate-pulse rounded-2xl bg-exp-surface-low" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
