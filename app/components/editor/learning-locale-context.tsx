"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  ContentLanguage,
  UiLocale,
} from "@/lib/i18n/locales";
import {
  toContentLanguage,
  toSpeechLocale,
} from "@/lib/i18n/locales";

export interface LearningLocaleValue {
  /** Bahasa antarmuka, mengikuti segmen rute. */
  uiLocale: UiLocale;
  /** Bahasa isi latihan, mengikuti target belajar pengguna. */
  contentLanguage: ContentLanguage;
  /** Kode BCP-47 untuk audio. */
  speechLocale: string;
  /** True jika target belajar berbeda dari bahasa konten default rute. */
  hasTargetMismatch: boolean;
  /** Level kurikulum aktif dari profil (N5/A1/…), jika ada. */
  curriculumLevel: string | null;
}

const LearningLocaleContext = createContext<LearningLocaleValue | null>(null);

export function LearningLocaleProvider({
  uiLocale,
  contentLanguage,
  targetLanguage,
  curriculumLevel,
  children,
}: {
  uiLocale: UiLocale;
  contentLanguage: ContentLanguage;
  targetLanguage?: string | null;
  curriculumLevel?: string | null;
  children: ReactNode;
}) {
  const value: LearningLocaleValue = {
    uiLocale,
    contentLanguage,
    speechLocale: toSpeechLocale(contentLanguage),
    hasTargetMismatch: Boolean(
      targetLanguage && targetLanguage !== toContentLanguage(uiLocale),
    ),
    curriculumLevel: curriculumLevel ?? null,
  };

  return (
    <LearningLocaleContext.Provider value={value}>
      {children}
    </LearningLocaleContext.Provider>
  );
}

export function useLearningLocale(): LearningLocaleValue {
  const value = useContext(LearningLocaleContext);
  if (!value) {
    throw new Error(
      "useLearningLocale must be used within LearningLocaleProvider",
    );
  }
  return value;
}
