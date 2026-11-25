import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import {
  isLanguageCode,
  isUiLocale,
  resolveContentLanguage,
} from "@/lib/i18n/locales";
import { getEpisodeJourney } from "@/lib/story/journey";
import { StoryHub } from "@/components/story/story-hub";
import { LanguageRail } from "@/components/expedition/language-rail";
import { LevelPills } from "@/components/expedition/level-pills";
import { expeditionCopy } from "@/components/expedition/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ReaderHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ language?: string; tier?: string; locked?: string }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = expeditionCopy(uiLocale);
  const requested =
    query.language && isLanguageCode(query.language) ? query.language : null;
  const language = requested ?? resolveContentLanguage(context.user.targetLanguage, uiLocale);
  const tier = query.tier && /^T[1-5]$/.test(query.tier) ? query.tier : null;

  const journey = await getEpisodeJourney(context.user.id, {
    language,
    tier,
    episodeId: query.locked ?? null,
  });

  if (!journey) {
    return (
      <>
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="exp-card p-10">
            <p className="text-lg font-extrabold">{copy.noQuestions}</p>
            <p className="mt-2 text-sm text-exp-on-surface-variant">{copy.noQuestionsBody}</p>
            <p className="mt-4 text-xs font-bold text-exp-outline">
              {language} · {copy.targetLanguage}
            </p>
          </div>
        </div>
      </>
    );
  }

  const locked = Boolean(query.locked && journey.current?.status === "locked");

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 pt-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <LanguageRail
          active={language}
          label={copy.targetLanguage}
          hrefFor={(code) => `/${lang}/reader?language=${code}${tier ? `&tier=${tier}` : ""}`}
        />
        <LevelPills
          levels={journey.levels.map((level) => ({
            tier: level.tier,
            label: level.label,
            levelCode: level.levelCode,
            framework: level.framework,
          }))}
          activeTier={journey.tier}
          label={copy.level}
          hrefFor={(nextTier) =>
            `/${lang}/reader?tier=${nextTier}${
              requested ? `&language=${requested}` : ""
            }`
          }
        />
      </div>
      <StoryHub journey={journey} lang={lang} locked={locked} />
    </>
  );
}
