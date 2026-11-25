import { publicOk } from "@/lib/api/auth-response";
import { getLanguageAvailability } from "@/lib/learning/content-repository";
import {
  LANGUAGE_SUPPORT_LIST,
  UI_LOCALES,
  LOCALE_DEFINITIONS,
} from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, cacheable language registry. Static metadata comes from the single
 * registry; availability/counts come from published DB content and therefore
 * cannot drift from what learners can actually open.
 */
export async function GET() {
  const availability = await getLanguageAvailability();

  return publicOk(
    {
      uiLocales: UI_LOCALES.map((locale) => ({
        locale,
        label: LOCALE_DEFINITIONS[locale].label,
        htmlLang: LOCALE_DEFINITIONS[locale].htmlLang,
        dir: LOCALE_DEFINITIONS[locale].dir,
      })),
      learningLanguages: LANGUAGE_SUPPORT_LIST.map((language) => ({
        ...language,
        status: availability[language.code].status,
        questionCount: availability[language.code].totalQuestions,
        lessonCount: availability[language.code].totalLessons,
        levelCount: availability[language.code].levels,
      })),
    },
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
}
