"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Compass,
  Headphones,
  LibraryBig,
  Lock,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { StoryArtwork } from "@/components/expedition/art";
import type { ExpeditionCopy } from "@/components/expedition/copy";
import { fill } from "@/components/expedition/copy";

export interface LibraryEpisode {
  id: string;
  title: string;
  nativeTitle: string;
  hook: string;
  tier: string;
  levelLabel: string;
  levelCode: string;
  framework: string;
  arcTitle: string;
  episodeNo: number;
  scenes: number;
  completed: number;
  status: "completed" | "active" | "available" | "locked";
  palette: string;
}

export interface LibraryData {
  lang: string;
  world: {
    id: string;
    title: string;
    nativeTitle: string;
    logline: string;
    setting: string;
    era: string;
    palette: string;
  };
  episodes: LibraryEpisode[];
  levels: Array<{ tier: string; label: string; framework: string; levelCode: string }>;
  featuredId: string | null;
  continueHref: string | null;
  continueTitle: string;
  continueEpisode: string;
  continueChapter: number;
  continueTotalChapters: number;
  completed: number;
  total: number;
  percent: number;
  inProgress: number;
  notOpened: number;
  sentences: number;
  levelRange: string;
  started: number;
}

const TIER_GROUP: Record<string, "beginner" | "intermediate" | "advanced"> = {
  T1: "beginner",
  T2: "beginner",
  T3: "intermediate",
  T4: "intermediate",
  T5: "advanced",
};

export function StoryLibrary({
  data,
  copy,
  initialTier = null,
}: {
  data: LibraryData;
  copy: ExpeditionCopy;
  initialTier?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [levelTier, setLevelTier] = useState<string>(initialTier ?? "all");
  const [onlyNew, setOnlyNew] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.episodes.filter((episode) => {
      const group = TIER_GROUP[episode.tier] ?? "beginner";
      if (tier !== "all" && group !== tier) return false;
      if (levelTier !== "all" && episode.tier !== levelTier) return false;
      if (onlyNew && episode.completed > 0) return false;
      if (!term) return true;
      return [episode.title, episode.nativeTitle, episode.hook, episode.arcTitle, episode.levelLabel]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [data.episodes, levelTier, onlyNew, query, tier]);

  const featured =
    data.episodes.find((episode) => episode.id === data.featuredId) ??
    data.episodes[0] ??
    null;

  const featuredHref = featured
    ? `/${data.lang}/stories/${data.world.id}/${featured.id}`
    : `/${data.lang}/stories`;

  const city = filtered.filter((episode) => (TIER_GROUP[episode.tier] ?? "beginner") !== "advanced").slice(0, 6);
  const legend = filtered.filter((episode) => (TIER_GROUP[episode.tier] ?? "beginner") === "advanced" || episode.completed > 0).slice(0, 6);
  const continuePercent =
    data.total === 0 ? 0 : Math.round((data.completed / data.total) * 100);
  const saved = filtered.filter((episode) => episode.completed === 0).slice(0, 2);

  const filterPills = [
    { key: "all", label: copy.allLevels },
    { key: "beginner", label: copy.beginner },
    { key: "intermediate", label: copy.intermediate },
    { key: "advanced", label: copy.advanced },
  ];

  const episodeCard = (episode: LibraryEpisode) => {
    const percent =
      episode.scenes === 0 ? 0 : Math.round((episode.completed / episode.scenes) * 100);
    const href = `/${data.lang}/stories/${data.world.id}/${episode.id}`;
    const locked = episode.status === "locked";
    return (
      <Link
        key={episode.id}
        href={href}
        className={`group flex flex-col overflow-hidden rounded-2xl bg-exp-surface-lowest shadow-sm transition-all ${
          locked ? "opacity-80" : "hover:-translate-y-0.5 hover:shadow-md"
        }`}
      >
        <div className="relative h-40 w-full">
          <StoryArtwork
            variantSeed={episode.id}
            palette={episode.palette}
            setting={data.world.setting}
            worldId={data.world.id}
            className="h-full w-full"
            overlay={false}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface/80 via-transparent to-exp-inverse-surface/25" />
            <span className="absolute left-2.5 top-2.5 rounded-full bg-exp-surface-lowest/90 px-2 py-0.5 text-[10px] font-extrabold text-exp-primary backdrop-blur">
              {episode.levelCode}
            </span>
            {locked ? (
              <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-exp-inverse-surface/85 px-2 py-0.5 text-[10px] font-extrabold text-exp-inverse-on-surface backdrop-blur">
                <Lock className="h-3 w-3" aria-hidden="true" />
                {copy.lockedEpisode}
              </span>
            ) : episode.completed >= episode.scenes && episode.scenes > 0 ? (
              <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-exp-primary px-2 py-0.5 text-[10px] font-extrabold text-exp-on-primary">
                <CheckMark />
                {fill(copy.complete, { percent: 100 })}
              </span>
            ) : episode.completed === 0 ? (
              <span className="absolute right-2.5 top-2.5 rounded-full bg-exp-secondary-container px-2 py-0.5 text-[10px] font-extrabold text-exp-on-secondary-container">
                {copy.newLabel}
              </span>
            ) : (
              <span className="absolute right-2.5 top-2.5 rounded-full bg-exp-surface-lowest/90 px-2 py-0.5 text-[10px] font-extrabold text-exp-secondary backdrop-blur">
                {copy.inProgress}
              </span>
            )}
          </StoryArtwork>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2 p-3.5">
          <div>
            <h4 className="line-clamp-1 text-sm font-extrabold group-hover:text-exp-primary">
              {episode.title}
            </h4>
            <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
              {episode.hook}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-exp-outline">
              <span className="flex items-center gap-1">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                {fill(copy.episodeCount, { count: episode.scenes })}
              </span>
              <span>{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-exp-container">
              <div
                className="h-full rounded-full bg-exp-primary-container"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      {/* Search deck */}
      <div className="flex flex-col gap-4 rounded-2xl bg-exp-surface-low p-4 shadow-sm lg:p-5">
        <div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
          <div className="relative flex w-full items-center lg:max-w-2xl">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-exp-outline" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              className="w-full rounded-full bg-exp-surface-lowest py-3.5 pl-11 pr-24 text-sm font-medium text-exp-on-surface shadow-sm outline-none ring-exp-primary-container placeholder:text-exp-outline focus:ring-2"
            />
            <button
              type="button"
              className="exp-btn exp-btn-primary absolute right-1.5 min-h-9 rounded-full px-4 text-xs"
              onClick={() => undefined}
            >
              {copy.search}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex w-full items-center justify-end gap-2 lg:w-auto">
            <span className="relative flex min-w-48 items-center gap-2 rounded-full bg-exp-surface-lowest px-3 py-2.5 shadow-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-exp-container text-exp-primary">
                <Compass className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-exp-outline">
                  {copy.targetLanguage}
                </span>
                <span className="truncate text-xs font-extrabold">{data.world.title}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOnlyNew((value) => !value)}
              aria-pressed={onlyNew}
              className={`hidden items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-extrabold sm:flex ${
                onlyNew ? "bg-exp-primary-container text-exp-on-primary" : "bg-exp-container-high text-exp-primary"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {copy.customize}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 exp-scroll-hide">
          <button
            type="button"
            onClick={() => setLevelTier("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold transition-all ${
              levelTier === "all"
                ? "bg-exp-secondary-container text-exp-on-secondary-container"
                : "bg-exp-surface-lowest text-exp-on-surface-variant shadow-sm hover:bg-exp-container-high"
            }`}
          >
            {copy.allLevels}
          </button>
          {data.levels.map((level) => (
            <button
              key={level.tier}
              type="button"
              onClick={() => setLevelTier(level.tier)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold transition-all ${
                levelTier === level.tier
                  ? "bg-exp-secondary-container text-exp-on-secondary-container"
                  : "bg-exp-surface-lowest text-exp-on-surface-variant shadow-sm hover:bg-exp-container-high"
              }`}
            >
              {level.levelCode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 exp-scroll-hide">
          {filterPills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setTier(pill.key)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold transition-all ${
                tier === pill.key
                  ? "bg-exp-primary text-exp-on-primary shadow-[0_3px_0_var(--exp-on-primary-container)]"
                  : "bg-exp-surface-lowest text-exp-on-surface-variant shadow-sm hover:bg-exp-container-high"
              }`}
            >
              {pill.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyNew((value) => !value)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-xs font-extrabold shadow-sm ${
              onlyNew ? "bg-exp-secondary-container text-exp-on-secondary-container" : "bg-exp-surface-lowest text-exp-on-surface-variant"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-exp-secondary" aria-hidden="true" />
            {copy.shortStories}
          </button>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-exp-surface-lowest px-3.5 py-2 text-xs font-extrabold text-exp-on-surface-variant shadow-sm">
            <Trophy className="h-3.5 w-3.5 text-exp-tertiary" aria-hidden="true" />
            {copy.rpg}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        {/* Catalog */}
        <div className="flex flex-col gap-6 xl:col-span-8">
          {featured && (
            <div className="overflow-hidden rounded-2xl bg-exp-surface-lowest shadow-md">
              <div className="relative h-[320px] w-full sm:h-[360px]">
                <StoryArtwork
                  variantSeed={featured.id}
                  palette={featured.palette}
                  setting={data.world.setting}
                  worldId={data.world.id}
                  className="h-full w-full"
                  overlay={false}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface via-exp-inverse-surface/55 to-exp-inverse-surface/10" />
                  <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-secondary-container px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-exp-on-secondary-container shadow-sm">
                        <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                        {copy.featured}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-surface-lowest/90 px-3 py-1.5 text-[10px] font-extrabold text-exp-primary shadow-sm backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {fill(copy.recommendedFor, { level: data.levelRange || featured.levelCode })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-exp-inverse-on-surface">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide">
                        <span className="rounded bg-exp-container-highest/30 px-1.5 py-0.5 backdrop-blur">
                          {featured.arcTitle}
                        </span>
                        <span>·</span>
                        <span className="text-exp-surface-dim">{featured.levelLabel}</span>
                      </div>
                      <h2 className="max-w-2xl text-2xl font-extrabold leading-tight text-exp-on-primary sm:text-3xl">
                        {featured.title}
                      </h2>
                      <p className="line-clamp-2 max-w-2xl text-xs font-medium leading-5 text-exp-container-high sm:text-sm">
                        {featured.hook}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-bold">
                        <span className="flex items-center gap-1">
                          <LibraryBig className="h-4 w-4 text-exp-tertiary-container" aria-hidden="true" />
                          {fill(copy.episodeCount, { count: featured.scenes })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-exp-primary-fixed-dim" aria-hidden="true" />
                          {fill(copy.newWords, { count: Math.max(8, featured.scenes * 3) })}
                        </span>
                        <span className="flex items-center gap-1 text-exp-secondary-fixed">
                          <Star className="h-4 w-4 fill-exp-secondary-container text-exp-secondary-container" aria-hidden="true" />
                          4.9
                        </span>
                      </div>
                    </div>
                  </div>
                </StoryArtwork>
              </div>
              <div className="flex flex-col items-center justify-between gap-3 bg-exp-surface-low p-4 sm:flex-row sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-exp-primary-container/20 text-exp-primary">
                    <Headphones className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold">{copy.nativeAudio}</p>
                    <p className="text-[11px] text-exp-on-surface-variant">{copy.audioSpeed}</p>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Link
                    href={`/${data.lang}/stories/${data.world.id}`}
                    className="exp-btn exp-btn-ghost flex-1 sm:flex-none"
                  >
                    {copy.synopsis}
                  </Link>
                  <Link href={featuredHref} className="exp-btn exp-btn-primary flex-1 sm:flex-none">
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    {copy.startReading}
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Collection
            title={copy.cityAdventures}
            icon="city"
            items={city}
            empty={copy.noQuestions}
            copy={copy}
            render={episodeCard}
          />
          <Collection
            title={copy.mysteries}
            icon="legend"
            items={legend}
            empty={copy.noQuestions}
            copy={copy}
            render={episodeCard}
          />
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-exp-outline-variant bg-exp-surface-lowest p-8 text-center">
              <p className="text-sm font-extrabold">{copy.noQuestions}</p>
              <p className="mt-1 text-xs text-exp-on-surface-variant">{copy.noQuestionsBody}</p>
            </div>
          )}
        </div>

        {/* Right rail */}
        <aside className="flex w-full flex-col gap-5 xl:col-span-4">
          <div className="exp-card flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
                <BookOpen className="h-4 w-4 text-exp-primary" aria-hidden="true" />
                {copy.myCollection}
              </h3>
              <span className="rounded-full bg-exp-container px-2 py-0.5 text-[10px] font-extrabold text-exp-on-surface-variant">
                {data.started} {copy.episodes}
              </span>
            </div>

            {data.continueHref && (
              <div className="flex flex-col gap-2 rounded-xl bg-exp-surface-low p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-exp-primary">
                    {copy.readingNow}
                  </span>
                  <span className="text-[10px] font-semibold text-exp-on-surface-variant">
                    {fill(copy.chapterOf, {
                      chapter: data.continueChapter,
                      total: data.continueTotalChapters,
                    })}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm font-extrabold">{data.continueTitle}</p>
                <p className="line-clamp-1 text-[11px] text-exp-on-surface-variant">
                  {data.continueEpisode}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-exp-container-highest">
                  <div
                    className="h-full rounded-full bg-exp-primary-container"
                    style={{ width: `${continuePercent}%` }}
                  />
                </div>
                <Link href={data.continueHref} className="exp-btn exp-btn-primary mt-1 w-full text-xs">
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  {copy.continueReading}
                </Link>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wide text-exp-outline">
                {copy.savedLater}
              </p>
              <div className="flex flex-col gap-1">
                {saved.map((episode) => (
                  <Link
                    key={episode.id}
                    href={`/${data.lang}/stories/${data.world.id}/${episode.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-exp-surface-low"
                  >
                    <span className="line-clamp-1 font-semibold">{episode.title}</span>
                    <span className="shrink-0 text-[10px] text-exp-on-surface-variant">
                      {episode.levelCode}
                    </span>
                  </Link>
                ))}
                {saved.length === 0 && (
                  <p className="px-2 text-[11px] text-exp-on-surface-variant">{copy.seeAll}</p>
                )}
              </div>
            </div>
          </div>

          <div className="exp-card flex flex-col gap-4 p-5">
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
              <Compass className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
              {copy.readingStats}
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(var(--exp-primary-container) 0 ${data.percent}%, var(--exp-container-highest) ${data.percent}% 100%)`,
                }}
              >
                <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-exp-surface-lowest">
                  <div className="text-center">
                    <p className="text-xl font-extrabold">{data.percent}%</p>
                    <p className="text-[9px] font-bold uppercase text-exp-outline">{copy.completed}</p>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-exp-primary-container" />
                  {copy.completedStat} ({Math.min(99, data.percent)}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-exp-secondary-container" />
                  {copy.inProgressStat} ({data.inProgress})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-exp-container-highest" />
                  {copy.notOpenedStat} ({data.notOpened})
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-exp-surface-low p-3 text-center">
                <p className="text-lg font-extrabold text-exp-primary">
                  {data.completed.toLocaleString("en-US")}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-exp-outline">
                  {copy.scenes}
                </p>
              </div>
              <div className="rounded-xl bg-exp-surface-low p-3 text-center">
                <p className="text-lg font-extrabold text-exp-secondary">{data.sentences}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-exp-outline">
                  {copy.sentencesRead}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-exp-primary-fixed/30 p-3 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
              <strong className="font-extrabold text-exp-primary">Lango:</strong> {copy.shellTip}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-exp-tertiary p-5 text-exp-on-primary shadow-md">
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-exp-tertiary-container/30 blur-2xl" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-exp-tertiary-fixed">
              {copy.featured}
            </span>
            <h3 className="mt-1 text-xl font-extrabold leading-tight">{copy.weeklyChallenge}</h3>
            <p className="mt-2 text-xs font-medium leading-5 text-exp-tertiary-fixed">
              {copy.weeklyChallengeBody}
            </p>
            <Link
              href={`/${data.lang}/practice`}
              className="exp-btn mt-3 w-full bg-exp-surface-lowest text-exp-tertiary shadow-[0_4px_0_var(--exp-on-tertiary-fixed)]"
            >
              {copy.joinChallenge}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
      <path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Collection({
  title,
  icon,
  items,
  empty,
  copy,
  render,
}: {
  title: string;
  icon: "city" | "legend";
  items: LibraryEpisode[];
  empty: string;
  copy: ExpeditionCopy;
  render: (episode: LibraryEpisode) => ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-exp-primary/10 text-exp-primary">
            {icon === "city" ? (
              <LibraryBig className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Users className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
          {title}
        </h3>
        <span className="flex items-center gap-0.5 text-xs font-extrabold text-exp-primary">
          {copy.seeAll}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(render)}</div>
    </section>
  );
}
