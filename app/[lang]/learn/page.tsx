import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookMarked,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  Flame,
  Gem,
  Lock,
  MapPin,
  Play,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { getExpeditionDashboard } from "@/lib/story/expedition";
import { StoryShell } from "@/components/story/story-shell";
import { LevelPills } from "@/components/expedition/level-pills";
import { LanguageRail } from "@/components/expedition/language-rail";
import { StoryArtwork, LangoMascot, pickArtVariant } from "@/components/expedition/art";
import { expeditionCopy, fill } from "@/components/expedition/copy";
import { storyCopy } from "@/components/story/story-copy";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

function questIcon(key: "read" | "words" | "xp") {
  if (key === "read") return BookMarked;
  if (key === "words") return Sparkles;
  return Zap;
}

function questLabel(copy: ReturnType<typeof expeditionCopy>, key: "read" | "words" | "xp") {
  if (key === "read") return copy.questRead;
  if (key === "words") return copy.questWords;
  return copy.questXp;
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tier?: string; language?: string }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  if (context.user.role !== "learner") redirect(`/${lang}/profile`);

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = expeditionCopy(uiLocale);
  const fallbackCopy = storyCopy(uiLocale);
  const language = resolveContentLanguage(
    query.language ?? context.user.targetLanguage,
    uiLocale,
  );
  const tier = query.tier && /^T[1-5]$/.test(query.tier) ? query.tier : null;
  const data = await getExpeditionDashboard(context.user, language, tier);
  const hoursLeft = Math.max(1, 23 - new Date().getHours());

  return (
    <StoryShell lang={lang} active="map">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:px-8 lg:py-8">
        {/* Welcome banner */}
        <section className="exp-hero relative overflow-hidden rounded-3xl p-5 text-exp-on-primary shadow-xl sm:p-7 lg:p-9">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-exp-on-primary/15 px-3.5 py-1.5 backdrop-blur">
                <Compass className="h-4 w-4 text-exp-secondary-fixed" aria-hidden="true" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-exp-inverse-on-surface">
                  {fill(copy.expeditionTag, {
                    world: data.catalog.worldTitle || fallbackCopy.stories,
                    session: data.catalog.levelCode || "1",
                  })}
                </span>
              </span>
              <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                {fill(copy.welcomeTitle, { name: data.hud.name.split(" ")[0] ?? data.hud.name })}
              </h1>
              <p className="max-w-2xl text-sm font-semibold leading-6 text-exp-inverse-on-surface/90 sm:text-[16px]">
                {fill(copy.welcomeIntro, {
                  world: data.catalog.nativeTitle || data.catalog.worldTitle || fallbackCopy.stories,
                })}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-on-primary/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <Zap className="h-4 w-4 text-exp-secondary-fixed" aria-hidden="true" />
                  {copy.bonusXp}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-on-primary/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <Check className="h-4 w-4 text-exp-primary-fixed" aria-hidden="true" />
                  {copy.chapterPerfect}
                </span>
              </div>
            </div>

            <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border-b-4 border-exp-container-highest bg-exp-surface-lowest p-3.5 text-exp-on-surface shadow-lg">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-exp-primary-fixed">
                <LangoMascot className="h-12 w-12" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-exp-primary">
                    Lango
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-exp-primary-container" />
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-5 text-exp-on-surface-variant">
                  “{data.mission?.hook ?? copy.shellTip}”
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="exp-card flex flex-col gap-2 p-3.5">
          <LanguageRail
            active={language}
            label={copy.targetLanguage}
            hrefFor={(code) =>
              `/${lang}/learn?language=${code}${tier ? `&tier=${tier}` : ""}`
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
          <LevelPills
            levels={data.levels}
            activeTier={
              tier ??
              data.levels.find((item) => item.label === data.catalog.levelLabel)?.tier ??
              null
            }
            label={copy.level}
            hrefFor={(value) => `/${lang}/learn?tier=${value}&language=${language}`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${lang}/results`}
              className="exp-pill bg-exp-container text-exp-on-surface-variant hover:bg-exp-container-high"
            >
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.results}
            </Link>
            <Link
              href={`/${lang}/stories?language=${language}`}
              className="text-[10px] font-extrabold text-exp-primary hover:underline"
            >
              {copy.library}
            </Link>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
          {/* Left column */}
          <section className="flex flex-col gap-5 xl:col-span-7">
            {/* Continue card */}
            <div className="exp-card flex flex-col gap-4 p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-exp-primary-container/20 text-exp-primary">
                    <Play className="h-6 w-6 fill-current" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-exp-secondary">
                      {copy.continueJourney}
                    </p>
                    <h2 className="truncate text-lg font-extrabold leading-tight">
                      {data.currentNode?.episodeTitle ?? copy.noQuestions}
                    </h2>
                  </div>
                </div>
                <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
                  {fill(copy.targetLevel, {
                    level: data.catalog.levelCode || data.hud.level,
                  })}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
                  <span>
                    {copy.journeyProgress} · {copy.interactivePhase}
                  </span>
                  <span className="text-exp-primary">{data.currentNode?.percent ?? 0}%</span>
                </div>
                <div className="exp-progress">
                  <span style={{ width: `${data.currentNode?.percent ?? 0}%` }} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-exp-on-surface-variant">
                  <Sparkles className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
                  {fill(copy.practiceDialog, { count: data.mission?.vocabulary ?? 0 })}
                </div>
                <Link
                  href={
                    data.currentNode?.sceneId
                      ? `/${lang}/reader/${data.currentNode.sceneId}`
                      : `/${lang}/stories`
                  }
                  className="exp-btn exp-btn-primary w-full sm:w-auto"
                >
                  {copy.startNow}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Quest map */}
            <div className="exp-card exp-dotted-map relative overflow-hidden p-5 lg:p-6">
              <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-exp-container-high pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-exp-primary">
                    {copy.storyMap}
                  </span>
                  <h3 className="mt-0.5 text-xl font-extrabold leading-tight">
                    {fill(copy.mapTitle, {
                      arc:
                        data.currentNode?.arcTitle ??
                        data.catalog.levelLabel ??
                        fallbackCopy.levels,
                    })}
                  </h3>
                </div>
                <span className="exp-pill bg-exp-container text-exp-on-surface">
                  <Star className="h-4 w-4 fill-exp-secondary-container text-exp-secondary-container" aria-hidden="true" />
                  {fill(copy.stars, { count: `${data.starsEarned} / ${data.starsTotal}` })}
                </span>
              </div>

              {data.nodes.length === 0 ? (
                <div className="relative z-10 rounded-2xl bg-exp-surface-lowest p-6 text-center">
                  <p className="text-sm font-bold">{fallbackCopy.noStories}</p>
                  <p className="mt-1 text-xs text-exp-on-surface-variant">{fallbackCopy.language}: {language}</p>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div
                    aria-hidden="true"
                    className="absolute bottom-24 top-8 hidden w-1 -translate-x-1/2 border-l-[3px] border-dashed border-exp-outline-variant md:block"
                  />
                  {data.nodes.map((node, index) => {
                    const offset =
                      index % 3 === 0
                        ? "md:-translate-x-20"
                        : index % 3 === 1
                          ? "md:translate-x-20"
                          : "md:translate-x-0";
                    if (node.status === "active") {
                      return (
                        <div key={node.id} className="relative flex w-full flex-col items-center">
                          <span className="relative z-20 -mb-2 inline-flex items-center gap-1 rounded-full bg-exp-surface-lowest px-3 py-1 text-[10px] font-extrabold text-exp-primary shadow-md">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {copy.activeMission}
                          </span>
                          <div className="relative z-10 grid place-items-center">
                            <span className="absolute h-28 w-28 rounded-full bg-exp-primary-container/25 motion-safe:animate-ping" />
                            <Link
                              href={
                                node.sceneId
                                  ? `/${lang}/reader/${node.sceneId}`
                                  : `/${lang}/stories`
                              }
                              aria-label={copy.startStory}
                              className="exp-tactile-node relative grid h-20 w-20 place-items-center ring-4 ring-exp-primary-container"
                            >
                              <Play className="h-9 w-9 fill-current" aria-hidden="true" />
                            </Link>
                          </div>
                          <div className="relative z-10 mt-3 w-full max-w-xs rounded-2xl border-2 border-exp-primary-container bg-exp-surface-lowest p-4 text-center shadow-xl">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-exp-primary">
                              <span className="h-2 w-2 rounded-full bg-exp-primary-container" />
                              {copy.activeMission}
                            </span>
                            <h4 className="mt-1 text-[16px] font-extrabold leading-snug">
                              {node.nativeTitle || node.title}
                            </h4>
                            <p className="mt-1 text-xs font-medium leading-5 text-exp-on-surface-variant">
                              {data.mission?.episodeTitle ?? copy.activeMissionDesc}
                            </p>
                            <Link
                              href={
                                node.sceneId
                                  ? `/${lang}/reader/${node.sceneId}`
                                  : `/${lang}/stories`
                              }
                              className="exp-btn exp-btn-amber mt-3 w-full"
                            >
                              {copy.startStory}
                              <span className="text-[11px] opacity-80">
                                +{Math.max(10, node.scenes * 10)} XP
                              </span>
                            </Link>
                          </div>
                        </div>
                      );
                    }
                    const locked = node.status === "locked";
                    return (
                      <div
                        key={node.id}
                        className={`relative flex w-full flex-col items-center ${offset}`}
                      >
                        {node.stars > 0 && (
                          <div className="relative z-20 -mb-1 flex items-center gap-0.5 rounded-full bg-exp-surface-lowest px-2 py-0.5 shadow-sm">
                            {Array.from({ length: node.stars }).map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className="h-3 w-3 fill-exp-secondary-container text-exp-secondary-container"
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                        )}
                        <div
                          className={`relative z-10 grid h-16 w-16 place-items-center rounded-full ${
                            locked
                              ? "exp-quest-locked"
                              : "bg-exp-primary-container text-exp-on-primary-container shadow-[0_6px_0_var(--exp-primary)]"
                          }`}
                        >
                          {locked ? (
                            <Lock className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <Check className="h-8 w-8" aria-hidden="true" />
                          )}
                        </div>
                        <div className="relative z-10 mt-2 max-w-[220px] rounded-xl bg-exp-surface-lowest/90 px-3 py-1.5 text-center shadow-sm">
                          <span
                            className={`block text-[9px] font-extrabold uppercase tracking-wider ${
                              locked ? "text-exp-on-surface-variant" : "text-exp-primary"
                            }`}
                          >
                            {locked ? copy.lockedBadge : copy.completedBadge}
                          </span>
                          <span className="block text-xs font-semibold leading-4">
                            {node.nativeTitle || node.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="relative flex w-full flex-col items-center md:translate-x-6">
                    <div className="relative">
                      <div className="grid h-20 w-20 rotate-3 place-items-center rounded-2xl bg-exp-container-high text-exp-outline shadow-[0_6px_0_var(--exp-outline-variant)]">
                        <Trophy className="h-9 w-9" aria-hidden="true" />
                      </div>
                      <span className="absolute -right-2 -top-2 rounded-full bg-exp-secondary px-2 py-0.5 text-[9px] font-extrabold uppercase text-exp-on-primary">
                        Boss
                      </span>
                    </div>
                    <div className="relative z-10 mt-3 max-w-[230px] rounded-xl bg-exp-surface-lowest/90 px-4 py-2 text-center shadow-sm">
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-exp-secondary">
                        {copy.bossExam}
                      </span>
                      <span className="block text-xs font-bold">{copy.bossDesc}</span>
                      <span className="mt-0.5 block text-[10px] font-bold text-exp-tertiary">
                        +150 XP
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-exp-container p-4">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-exp-primary" aria-hidden="true" />
                  <p className="text-xs font-medium text-exp-on-surface-variant">
                    <strong className="font-extrabold text-exp-on-surface">{copy.tipTitle}:</strong>{" "}
                    {copy.tipBody}
                  </p>
                </div>
                <Link
                  href={`/${lang}/stories`}
                  className="shrink-0 text-xs font-extrabold text-exp-primary hover:underline"
                >
                  {copy.viewGuide}
                </Link>
              </div>
            </div>

            {/* Location snapshot */}
            <div className="relative overflow-hidden rounded-2xl shadow-md">
              <StoryArtwork
                variant={
                  data.currentSceneSetting
                    ? pickArtVariant(`${data.catalog.worldId}-${data.currentSceneSetting}`)
                    : "city"
                }
                palette={data.catalog.palette}
                setting={data.currentSceneSetting}
                worldId={data.currentWorldId}
                className="h-48 w-full"
              >
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-exp-secondary-fixed">
                      {copy.currentLocation}
                    </span>
                    <h4 className="truncate text-[16px] font-extrabold text-exp-on-primary sm:text-lg">
                      {data.currentSceneSetting || data.catalog.nativeTitle}
                    </h4>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-exp-surface-lowest/20 px-3 py-1.5 text-xs font-bold text-exp-on-primary backdrop-blur">
                    <Clock className="h-4 w-4 text-exp-secondary-fixed" aria-hidden="true" />
                    {data.readingStats.level > 0 ? data.readingStats.range : copy.start}
                  </span>
                </div>
              </StoryArtwork>
            </div>
          </section>

          {/* Right column */}
          <aside className="flex w-full flex-col gap-5 xl:col-span-5">
            {/* Daily quests */}
            <div className="exp-card flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-exp-secondary-fixed text-exp-secondary">
                    <Target className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-[16px] font-extrabold">{copy.dailyQuests}</h3>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-exp-on-surface-variant">
                  <Timer className="h-3.5 w-3.5 text-exp-error" aria-hidden="true" />
                  {fill(copy.timeLeft, { time: `${hoursLeft}j` })}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {data.quests.map((quest) => {
                  const Icon = questIcon(quest.key);
                  const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
                  return (
                    <div
                      key={quest.key}
                      className="flex items-center justify-between gap-2 rounded-xl bg-exp-surface-low p-2.5"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                            quest.done
                              ? "bg-exp-primary-container text-exp-on-primary-container"
                              : "bg-exp-secondary-fixed text-exp-secondary"
                          }`}
                        >
                          {quest.done ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`truncate text-xs font-bold ${
                                quest.done ? "line-through decoration-exp-primary decoration-2" : ""
                              }`}
                            >
                              {questLabel(copy, quest.key)}
                            </span>
                            <span className="shrink-0 text-[10px] font-extrabold text-exp-on-surface-variant">
                              {quest.current} / {quest.target}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-exp-container-highest">
                            <div
                              className={`h-full rounded-full ${
                                quest.done ? "bg-exp-primary-container" : "bg-exp-secondary-container"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-extrabold text-exp-secondary">
                        +{quest.reward} XP
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-exp-secondary-fixed to-exp-secondary-fixed-dim p-3 text-exp-secondary">
                <div className="flex min-w-0 items-center gap-2">
                  <Gem className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold">{copy.dailyChest}</p>
                    <p className="truncate text-[10px] font-semibold opacity-80">
                      {copy.dailyChestDesc}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${lang}/store`}
                  className="shrink-0 rounded-full bg-exp-surface-lowest px-2.5 py-1 text-[10px] font-extrabold text-exp-secondary shadow-sm"
                >
                  {copy.viewContents}
                </Link>
              </div>
            </div>

            {/* Vocabulary vault */}
            <div className="exp-card flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-exp-tertiary-fixed text-exp-tertiary">
                    <BookMarked className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-extrabold leading-tight">{copy.vocabVault}</h3>
                    <p className="text-[10px] font-semibold text-exp-on-surface-variant">
                      {fill(copy.mastered, { count: data.vocab.length + data.readingStats.completed * 3 })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${lang}/review`}
                  className="shrink-0 text-[10px] font-extrabold text-exp-tertiary hover:underline"
                >
                  {fill(copy.testMemory, { count: Math.max(1, data.vocab.length) })}
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {data.vocab.length === 0 ? (
                  <p className="text-xs font-medium text-exp-on-surface-variant">{copy.noVocab}</p>
                ) : (
                  data.vocab.map((word, index) => (
                    <span
                      key={`${word.term}-${index}`}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs ${
                        index === 3
                          ? "bg-exp-container-high"
                          : "bg-exp-container"
                      }`}
                    >
                      <strong className="font-extrabold">{word.term}</strong>
                      {word.reading && word.reading !== word.term && (
                        <span className="text-[10px] text-exp-outline">({word.reading})</span>
                      )}
                      <span className="text-[10px] font-normal text-exp-on-surface-variant">
                        · {word.gloss}
                      </span>
                    </span>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl bg-exp-surface-low p-2.5">
                <span className="text-[11px] font-medium text-exp-on-surface-variant">
                  {fill(copy.reviewDue, { count: data.hud.dueReview })}
                </span>
                <Link
                  href={`/${lang}/review`}
                  className="rounded-full bg-exp-primary px-3 py-1 text-[10px] font-extrabold text-exp-on-primary shadow-sm hover:brightness-110"
                >
                  {copy.quickReview}
                </Link>
              </div>
            </div>

            {/* League */}
            <div className="exp-card flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-exp-secondary-fixed text-exp-secondary">
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-extrabold leading-tight">{copy.league}</h3>
                    <p className="text-[10px] font-bold text-exp-secondary">{copy.leagueZone}</p>
                  </div>
                </div>
                <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                  {copy.top10}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {data.league.slice(0, 3).map((row, index) => (
                  <div
                    key={row.id}
                    className={`flex items-center justify-between gap-2 rounded-xl p-1.5 ${
                      row.isMe ? "border-2 border-exp-primary-container bg-exp-primary-fixed/20" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`w-5 shrink-0 text-center text-sm font-black ${
                          index === 0 ? "text-exp-secondary-container" : "text-exp-outline"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-exp-container text-[10px] font-extrabold text-exp-on-surface-variant">
                        {row.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">
                          {row.isMe ? fill(copy.you, { name: row.name }) : row.name}
                        </p>
                        <p className="text-[10px] font-semibold text-exp-secondary">
                          {row.streak} {copy.streakDays}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-extrabold text-exp-primary">
                      {row.xp.toLocaleString("en-US")} XP
                    </span>
                  </div>
                ))}
                {data.league.length === 0 && (
                  <p className="text-xs text-exp-on-surface-variant">{copy.leagueEmpty}</p>
                )}
              </div>
              <Link
                href={`/${lang}/leaderboard`}
                className="rounded-xl bg-exp-container py-2 text-center text-xs font-extrabold text-exp-primary hover:bg-exp-container-high"
              >
                {copy.viewRanking}
              </Link>
            </div>

            {/* Study buddies from real league peers */}
            <div className="exp-card flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
                  <Users className="h-4 w-4 text-exp-primary" aria-hidden="true" />
                  {copy.studyBuddies}
                </h3>
                <span className="h-2.5 w-2.5 rounded-full bg-exp-primary" />
              </div>
              {data.league.filter((row) => !row.isMe).slice(0, 2).map((row, index) => (
                <div key={row.id} className="flex items-center justify-between gap-2 rounded-xl bg-exp-surface-low p-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-exp-primary-fixed text-[10px] font-extrabold">
                      {row.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{row.name}</p>
                      <p className="text-[10px] text-exp-on-surface-variant">
                        {copy.explorer} · {row.level}
                      </p>
                    </div>
                  </div>
                  {index === 0 ? (
                    <Crown className="h-4 w-4 text-exp-secondary-container" aria-hidden="true" />
                  ) : (
                    <Flame className="h-4 w-4 text-exp-secondary-container" aria-hidden="true" />
                  )}
                </div>
              ))}
              {data.league.filter((row) => !row.isMe).length === 0 && (
                <p className="text-xs text-exp-on-surface-variant">{copy.leagueEmpty}</p>
              )}
              <Link
                href={`/${lang}/leaderboard`}
                className="flex items-center justify-center gap-1 text-xs font-extrabold text-exp-primary hover:underline"
              >
                {copy.invite}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </StoryShell>
  );
}
