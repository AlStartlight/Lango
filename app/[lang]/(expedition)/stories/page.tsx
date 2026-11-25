import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LANGUAGE_SUPPORT_LIST,
  isLanguageCode,
  isUiLocale,
  resolveContentLanguage,
} from "@/lib/i18n/locales";
import { getSessionContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getStoryContent } from "@/lib/story/content";
import { getStoryCatalog, getWorldDetail } from "@/lib/story/repository";
import { expeditionCopy } from "@/components/expedition/copy";
import {
  StoryLibrary,
  type LibraryData,
  type LibraryEpisode,
} from "@/components/story/story-library";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

function episodeIdFromScene(sceneId: string): string {
  const arcId = sceneId.replace(/-p\d+$/, "");
  const sceneNumber = Number(sceneId.match(/-p(\d+)$/)?.[1] ?? "1");
  return `${arcId}-l${String(Math.ceil(sceneNumber / 10)).padStart(2, "0")}`;
}

export default async function StoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ language?: string; tier?: string }>;
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

  const catalog = await getStoryCatalog(context.user.id, language);
  if (!catalog?.world) {
    return (
      <>
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="exp-card p-10">
            <p className="text-lg font-extrabold">{copy.noQuestions}</p>
            <p className="mt-2 text-sm text-exp-on-surface-variant">
              {copy.noQuestionsBody}
            </p>
            <p className="mt-4 text-xs font-bold text-exp-outline">
              {language} · {copy.targetLanguage}
            </p>
          </div>
        </div>
      </>
    );
  }

  const detail = await getWorldDetail(context.user.id, catalog.world.id);
  if (!detail) redirect(`/${lang}/learn`);

  const content = (() => {
    try {
      return getStoryContent(language);
    } catch {
      return null;
    }
  })();

  const [progressRows, inProgress] = prisma
    ? await Promise.all([
        prisma.storySceneProgress.findMany({
          where: { userId: context.user.id, languageCode: language, status: "completed" },
          select: { sceneId: true },
        }),
        prisma.storySceneProgress.count({
          where: { userId: context.user.id, languageCode: language, status: "in_progress" },
        }),
      ])
    : [[], 0];

  const sentences = progressRows.reduce(
    (total, row) => total + (content?.scenes.get(row.sceneId)?.lines.length ?? 0),
    0,
  );

  const episodes: LibraryEpisode[] = detail.levels.flatMap((level) =>
    level.arcs.flatMap((arc) =>
      arc.episodes.map((episode) => ({
        id: episode.id,
        title: episode.nativeTitle || episode.title,
        nativeTitle: episode.nativeTitle,
        hook: episode.hook,
        tier: level.tier,
        levelLabel: level.label,
        levelCode: level.levelCode,
        framework: level.framework,
        arcTitle: arc.nativeTitle,
        episodeNo: episode.episodeNo,
        scenes: episode.scenes,
        completed: episode.completed,
        status: episode.status,
        palette: detail.world.palette,
      })),
    ),
  );

  const currentEpisodeId = catalog.continue
    ? episodeIdFromScene(catalog.continue.sceneId)
    : null;
  const featuredId =
    episodes.find((episode) => episode.id === currentEpisodeId)?.id ??
    episodes.find((episode) => episode.completed < episode.scenes)?.id ??
    episodes[0]?.id ??
    null;
  const featuredEpisode = episodes.find((episode) => episode.id === featuredId) ?? null;
  const continueEpisode = episodes.find((episode) => episode.id === currentEpisodeId) ?? null;

  const data: LibraryData = {
    lang,
    world: {
      id: detail.world.id,
      title: detail.world.title,
      nativeTitle: detail.world.nativeTitle,
      logline: detail.world.logline,
      setting: detail.world.setting,
      era: detail.world.era,
      palette: detail.world.palette,
    },
    episodes,
    levels: detail.levels.map((level) => ({
      tier: level.tier,
      label: level.label,
      framework: level.framework,
      levelCode: level.levelCode,
    })),
    featuredId,
    continueHref: catalog.continue ? `/${lang}/reader/${catalog.continue.sceneId}` : null,
    continueTitle: catalog.continue?.episodeTitle ?? featuredEpisode?.title ?? "",
    continueEpisode: catalog.continue?.title ?? "",
    continueChapter: continueEpisode
      ? Math.min(continueEpisode.scenes, continueEpisode.completed + 1)
      : 1,
    continueTotalChapters: continueEpisode?.scenes ?? 10,
    completed: detail.completed,
    total: detail.total,
    percent: detail.percent,
    inProgress,
    notOpened: Math.max(0, detail.total - detail.completed - inProgress),
    sentences,
    levelRange:
      detail.levels.find((level) => level.levelCode === context.user.curriculumLevel)?.label ??
      featuredEpisode?.levelLabel ??
      "",
    started: progressRows.length + inProgress,
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2 overflow-x-auto px-4 pt-4 exp-scroll-hide sm:px-6 lg:px-8">
        <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
          {copy.targetLanguage}
        </span>
        {LANGUAGE_SUPPORT_LIST.map((support) => (
          <Link
            key={support.code}
            href={`/${lang}/stories?language=${support.code}`}
            aria-current={support.code === language ? "page" : undefined}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition-colors ${
              support.code === language
                ? "bg-exp-primary text-exp-on-primary"
                : "bg-exp-surface-lowest text-exp-on-surface-variant hover:bg-exp-container"
            }`}
          >
            {support.label}
          </Link>
        ))}
      </div>
      <StoryLibrary
        data={data}
        copy={copy}
        initialTier={query.tier && /^T[1-5]$/.test(query.tier) ? query.tier : null}
      />
    </>
  );
}
