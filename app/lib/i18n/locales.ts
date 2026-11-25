import { languages, type Language } from "../../i18n-config";

/**
 * Locale publik yang dipakai di segmen rute `[lang]`.
 * Ini adalah bahasa tampilan (UI), bukan bahasa yang dipelajari.
 */
export type UiLocale = Language;

export const UI_LOCALES = languages;

export const LOCALE_COOKIE = "lango_locale";

export const UI_LOCALE_SET: ReadonlySet<string> = new Set(languages);

/** Kode kanonik untuk konten, API, database, dan TTS. */
export const LANGUAGE_CODES = [
  "en",
  "es",
  "id",
  "ja",
  "hi",
  "de",
  "ar",
  "fr",
  "pt",
  "it",
  "nl",
  "ko",
  "zh",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

/** Nama lama yang masih dipakai modul belajar (FS-07/FS-09). */
export type ContentLanguage = LanguageCode;

export const CONTENT_LANGUAGES = LANGUAGE_CODES;

export type Framework = "JLPT" | "CEFR" | "HSK";

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
// HSK 2.0 1–6 mapped to five internal tiers (PRD D-14).
export const HSK_LEVELS = ["HSK1-2", "HSK3", "HSK4", "HSK5", "HSK6"] as const;

export type JlptLevel = (typeof JLPT_LEVELS)[number];
export type CefrLevel = (typeof CEFR_LEVELS)[number];
export type HskLevel = (typeof HSK_LEVELS)[number];
export type CurriculumLevelCode = JlptLevel | CefrLevel | HskLevel;

export const CURRICULUM_LEVELS_BY_FRAMEWORK: Record<
  Framework,
  readonly CurriculumLevelCode[]
> = {
  JLPT: JLPT_LEVELS,
  CEFR: CEFR_LEVELS,
  HSK: HSK_LEVELS,
};

export const ALL_CURRICULUM_LEVELS: readonly CurriculumLevelCode[] = [
  ...JLPT_LEVELS,
  ...CEFR_LEVELS,
  ...HSK_LEVELS,
];

export type Availability = "full" | "beta" | "preview" | "none";
export type ContentStatus = "draft" | "in_review" | "published" | "retired";

export type QuestionType =
  | "multiple_choice"
  | "fill_blank"
  | "ordering"
  | "matching"
  | "kanji_reading"
  | "reading_comprehension"
  | "listening_comprehension"
  | "correction";

export interface LanguageSupport {
  code: LanguageCode;
  routeLocale: UiLocale;
  label: string;
  englishLabel: string;
  flag: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
  speechLocale: string;
  framework: Framework;
  levels: readonly CurriculumLevelCode[];
  /**
   * Status deklarasi build-time. API `GET /api/v1/languages` adalah sumber
   * final karena menghitung soal published dari database.
   */
  status: Availability;
  questionCount: number;
  lessonCount: number;
  variant?: string;
}

export const CONTENT_LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  es: "Español",
  id: "Bahasa Indonesia",
  ja: "日本語",
  hi: "हिन्दी",
  de: "Deutsch",
  ar: "العربية",
  fr: "Français",
  pt: "Português",
  it: "Italiano",
  nl: "Nederlands",
  ko: "한국어",
  zh: "中文",
};

export const CONTENT_LANGUAGE_ENGLISH_LABELS: Record<LanguageCode, string> = {
  en: "English",
  es: "Spanish",
  id: "Indonesian",
  ja: "Japanese",
  hi: "Hindi",
  de: "German",
  ar: "Arabic",
  fr: "French",
  pt: "Portuguese",
  it: "Italian",
  nl: "Dutch",
  ko: "Korean",
  zh: "Mandarin Chinese",
};

export interface LocaleDefinition {
  /** Nama bahasa tampilan (endonym). */
  label: string;
  /** Nilai yang valid untuk atribut `lang` HTML. */
  htmlLang: string;
  /** Arah layout untuk locale ini. */
  dir: "ltr" | "rtl";
  /** Bahasa konten default ketika profil belum punya target yang valid. */
  contentLanguage: LanguageCode;
  /** Kode BCP-47 untuk SpeechSynthesis. */
  speechLocale: string;
}

const LOCALE_CONTENT: Record<UiLocale, LanguageCode> = {
  en: "en",
  es: "es",
  id: "id",
  jp: "ja",
  hi: "hi",
  de: "de",
  ar: "ar",
  fr: "fr",
  pt: "pt",
  it: "it",
  nl: "nl",
  ko: "ko",
};

const SPEECH_LOCALES: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  id: "id-ID",
  ja: "ja-JP",
  hi: "hi-IN",
  de: "de-DE",
  ar: "ar-SA",
  fr: "fr-FR",
  pt: "pt-BR",
  it: "it-IT",
  nl: "nl-NL",
  ko: "ko-KR",
  zh: "zh-CN",
};

const HTML_LANGS: Record<LanguageCode, string> = {
  en: "en",
  es: "es",
  id: "id",
  ja: "ja",
  hi: "hi",
  de: "de",
  ar: "ar",
  fr: "fr",
  pt: "pt",
  it: "it",
  nl: "nl",
  ko: "ko",
  zh: "zh-Hans",
};

const FLAGS: Record<LanguageCode, string> = {
  en: "/images/flags/england.png",
  es: "/images/flags/spain.png",
  id: "/images/flags/indonesia.svg",
  ja: "/images/flags/japan.svg",
  hi: "/images/flags/India.png",
  de: "/images/flags/germany.png",
  ar: "/images/flags/arab.png",
  fr: "/images/flags/france.png",
  pt: "/images/flags/portugal.png",
  it: "/images/flags/italy.png",
  nl: "/images/flags/netherlands.png",
  ko: "/images/flags/south-korea.svg",
  zh: "/images/flags/china.svg",
};

/**
 * Peta locale aplikasi. Rute publik tetap memakai `jp` demi kompatibilitas,
 * sementara semua data/API memakai kode kanonik `ja`.
 */
export const LOCALE_DEFINITIONS: Record<UiLocale, LocaleDefinition> = Object.fromEntries(
  languages.map((locale) => {
    const code = LOCALE_CONTENT[locale];
    return [
      locale,
      {
        label: CONTENT_LANGUAGE_LABELS[code],
        htmlLang: HTML_LANGS[code],
        dir: code === "ar" ? "rtl" : "ltr",
        contentLanguage: code,
        speechLocale: SPEECH_LOCALES[code],
      },
    ];
  }),
) as Record<UiLocale, LocaleDefinition>;

export const LANGUAGE_REGISTRY: Record<LanguageCode, LanguageSupport> = {
  en: {
    code: "en",
    routeLocale: "en",
    label: "English",
    englishLabel: "English",
    flag: FLAGS.en,
    htmlLang: "en",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.en,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
    variant: "en-US",
  },
  es: {
    code: "es",
    routeLocale: "es",
    label: "Español",
    englishLabel: "Spanish",
    flag: FLAGS.es,
    htmlLang: "es",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.es,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
    variant: "es-ES",
  },
  id: {
    code: "id",
    routeLocale: "id",
    label: "Bahasa Indonesia",
    englishLabel: "Indonesian",
    flag: FLAGS.id,
    htmlLang: "id",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.id,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  ja: {
    code: "ja",
    routeLocale: "jp",
    label: "日本語",
    englishLabel: "Japanese",
    flag: FLAGS.ja,
    htmlLang: "ja",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.ja,
    framework: "JLPT",
    levels: JLPT_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  hi: {
    code: "hi",
    routeLocale: "hi",
    label: "हिन्दी",
    englishLabel: "Hindi",
    flag: FLAGS.hi,
    htmlLang: "hi",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.hi,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  de: {
    code: "de",
    routeLocale: "de",
    label: "Deutsch",
    englishLabel: "German",
    flag: FLAGS.de,
    htmlLang: "de",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.de,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  ar: {
    code: "ar",
    routeLocale: "ar",
    label: "العربية",
    englishLabel: "Arabic",
    flag: FLAGS.ar,
    htmlLang: "ar",
    dir: "rtl",
    speechLocale: SPEECH_LOCALES.ar,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
    variant: "ar-MSA",
  },
  fr: {
    code: "fr",
    routeLocale: "fr",
    label: "Français",
    englishLabel: "French",
    flag: FLAGS.fr,
    htmlLang: "fr",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.fr,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  pt: {
    code: "pt",
    routeLocale: "pt",
    label: "Português",
    englishLabel: "Portuguese",
    flag: FLAGS.pt,
    htmlLang: "pt",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.pt,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
    variant: "pt-BR",
  },
  it: {
    code: "it",
    routeLocale: "it",
    label: "Italiano",
    englishLabel: "Italian",
    flag: FLAGS.it,
    htmlLang: "it",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.it,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  nl: {
    code: "nl",
    routeLocale: "nl",
    label: "Nederlands",
    englishLabel: "Dutch",
    flag: FLAGS.nl,
    htmlLang: "nl",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.nl,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  ko: {
    code: "ko",
    routeLocale: "ko",
    label: "한국어",
    englishLabel: "Korean",
    flag: FLAGS.ko,
    htmlLang: "ko",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.ko,
    framework: "CEFR",
    levels: CEFR_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
  },
  zh: {
    code: "zh",
    // The UI locale for Mandarin ships after the content language; story and
    // curriculum URLs keep using the active UI locale until then.
    routeLocale: "en",
    label: "中文",
    englishLabel: "Mandarin Chinese",
    flag: FLAGS.zh,
    htmlLang: "zh-Hans",
    dir: "ltr",
    speechLocale: SPEECH_LOCALES.zh,
    framework: "HSK",
    levels: HSK_LEVELS,
    status: "none",
    questionCount: 0,
    lessonCount: 0,
    variant: "zh-CN",
  },
};

export const LANGUAGE_SUPPORT_LIST = LANGUAGE_CODES.map(
  (code) => LANGUAGE_REGISTRY[code],
);

export function isUiLocale(value: string): value is UiLocale {
  return UI_LOCALE_SET.has(value);
}

export function isContentLanguage(value: string): value is LanguageCode {
  return (LANGUAGE_CODES as readonly string[]).includes(value);
}

export function isLanguageCode(value: string): value is LanguageCode {
  return isContentLanguage(value);
}

export function isFramework(value: string): value is Framework {
  return value === "JLPT" || value === "CEFR" || value === "HSK";
}

export function isCurriculumLevel(value: string): value is CurriculumLevelCode {
  return (ALL_CURRICULUM_LEVELS as readonly string[]).includes(value);
}

export function frameworkForLanguage(code: LanguageCode): Framework {
  return LANGUAGE_REGISTRY[code].framework;
}

export function levelsForLanguage(
  code: LanguageCode,
): readonly CurriculumLevelCode[] {
  return LANGUAGE_REGISTRY[code].levels;
}

export function isLevelForLanguage(
  code: LanguageCode,
  level: string,
): level is CurriculumLevelCode {
  return (levelsForLanguage(code) as readonly string[]).includes(level);
}

export function defaultLevelForLanguage(code: LanguageCode): CurriculumLevelCode {
  return levelsForLanguage(code)[0];
}

export function getLanguageSupport(code: LanguageCode): LanguageSupport {
  return LANGUAGE_REGISTRY[code];
}

export function languageCodeForLocale(locale: string): LanguageCode | null {
  return isUiLocale(locale) ? LOCALE_DEFINITIONS[locale].contentLanguage : null;
}

export function getLocaleDefinition(locale: string): LocaleDefinition {
  return isUiLocale(locale) ? LOCALE_DEFINITIONS[locale] : LOCALE_DEFINITIONS.en;
}

/** `jp` (rute) → `ja` (konten/API/TTS). */
export function toContentLanguage(locale: string): LanguageCode {
  return getLocaleDefinition(locale).contentLanguage;
}

/** `ja` (konten) → `jp` (rute publik). */
export function toRouteLocale(code: string): UiLocale {
  if (isUiLocale(code)) return code;
  if (!isContentLanguage(code)) return "en";
  return LANGUAGE_REGISTRY[code].routeLocale;
}

/** `jp` tidak valid sebagai BCP-47; HTML harus memakai `ja`. */
export function toHtmlLang(locale: string): string {
  return getLocaleDefinition(locale).htmlLang;
}

export function toTextDirection(locale: string): "ltr" | "rtl" {
  return getLocaleDefinition(locale).dir;
}

export function toSpeechLocale(language: string): string {
  return isContentLanguage(language)
    ? SPEECH_LOCALES[language]
    : SPEECH_LOCALES.en;
}

/**
 * Bahasa isi mengikuti profil pengguna. Fallback hanya untuk nilai yang
 * rusak/tidak dikenal — bukan untuk bahasa valid yang belum punya kurikulum.
 */
export function resolveContentLanguage(
  targetLanguage: string | null | undefined,
  uiLocale: string,
): LanguageCode {
  if (targetLanguage && isContentLanguage(targetLanguage)) {
    return targetLanguage;
  }
  return toContentLanguage(uiLocale);
}

/** Normalisasi nilai legacy ("Japanese", "jp", "ja-JP") ke kode kanonik. */
export function normalizeLanguageCode(value: string | null | undefined): LanguageCode {
  if (!value) return "en";
  const raw = value.trim();
  if (isContentLanguage(raw)) return raw;

  const lowered = raw.toLowerCase().replace(/_/g, "-");
  if (isContentLanguage(lowered)) return lowered;

  const aliases: Record<string, LanguageCode> = {
    in: "id",
    "id-id": "id",
    indonesian: "id",
    "bahasa indonesia": "id",
    jp: "ja",
    "ja-jp": "ja",
    japanese: "ja",
    "日本語": "ja",
    en: "en",
    "en-us": "en",
    "en-gb": "en",
    english: "en",
    "english (us)": "en",
    "english (uk)": "en",
    es: "es",
    "es-es": "es",
    spanish: "es",
    "español": "es",
    fr: "fr",
    "fr-fr": "fr",
    french: "fr",
    "français": "fr",
    de: "de",
    "de-de": "de",
    german: "de",
    deutsch: "de",
    pt: "pt",
    "pt-br": "pt",
    "pt-pt": "pt",
    portuguese: "pt",
    "português": "pt",
    it: "it",
    "it-it": "it",
    italian: "it",
    italiano: "it",
    nl: "nl",
    "nl-nl": "nl",
    dutch: "nl",
    nederlands: "nl",
    ko: "ko",
    "ko-kr": "ko",
    korean: "ko",
    "한국어": "ko",
    hi: "hi",
    "hi-in": "hi",
    hindi: "hi",
    "हिन्दी": "hi",
    ar: "ar",
    "ar-sa": "ar",
    "ar-mas": "ar",
    arabic: "ar",
    "العربية": "ar",
    zh: "zh",
    "zh-cn": "zh",
    "zh-hans": "zh",
    "zh-sg": "zh",
    chinese: "zh",
    mandarin: "zh",
    "中文": "zh",
  };

  return aliases[lowered] ?? "en";
}

/** Availability final dari hitungan soal published. */
export function availabilityFromCounts(
  questions: number,
  lessons: number,
): Availability {
  if (questions >= 10_500 && lessons >= 300) return "full";
  if (questions >= 2_100) return "beta";
  if (questions >= 1) return "preview";
  return "none";
}

/** Parse `Accept-Language` q-values and pick the first supported locale. */
export function preferredLocaleFromAcceptLanguage(
  header: string | null | undefined,
  supported: readonly string[] = UI_LOCALES,
): UiLocale {
  if (!header) return "en";

  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return {
        tag: tag.toLowerCase(),
        base: tag.toLowerCase().split("-")[0],
        q: Number.isFinite(q) ? q : 0,
        index,
      };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  const aliases: Record<string, string> = {
    ja: "jp",
    in: "id",
    "en-us": "en",
    "pt-br": "pt",
  };

  for (const entry of ranked) {
    const exact = supported.find((locale) => locale.toLowerCase() === entry.tag);
    if (exact) return exact as UiLocale;
    const tagAlias = aliases[entry.tag];
    if (tagAlias && supported.includes(tagAlias)) return tagAlias as UiLocale;
    const base = supported.find((locale) => locale.toLowerCase() === entry.base);
    if (base) return base as UiLocale;
    const baseAlias = aliases[entry.base];
    if (baseAlias && supported.includes(baseAlias)) return baseAlias as UiLocale;
  }

  return "en";
}


/** Script family untuk pemilihan font/line-height. */
export function toScript(locale: string): "latn" | "jpan" | "hang" | "deva" | "arab" {
  switch (toContentLanguage(locale)) {
    case "ja":
      return "jpan";
    case "ko":
      return "hang";
    case "hi":
      return "deva";
    case "ar":
      return "arab";
    default:
      return "latn";
  }
}
