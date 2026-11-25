import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { getPracticeSet } from "@/lib/story/expedition";
import { getStoryCatalog, getWorldDetail } from "@/lib/story/repository";
import { PracticeQuiz } from "@/components/story/practice-quiz";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PracticePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const language = resolveContentLanguage(context.user.targetLanguage, uiLocale);
  const [questions, catalog] = await Promise.all([
    getPracticeSet(context.user, language),
    getStoryCatalog(context.user.id, language),
  ]);
  const detail = catalog?.world
    ? await getWorldDetail(context.user.id, catalog.world.id)
    : null;

  const levels =
    detail?.levels.map((level) => ({
      tier: level.tier,
      label: level.label,
      levelCode: level.levelCode,
    })) ?? [];

  return (
    <>
      <PracticeQuiz
        lang={lang}
        locale={uiLocale}
        languageCode={language}
        questions={questions}
        levels={levels}
      />
    </>
  );
}
