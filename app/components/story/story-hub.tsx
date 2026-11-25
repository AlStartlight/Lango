import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Lock,
  Mic,
  Play,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { StoryArtwork } from "@/components/expedition/art";
import { expeditionCopy, fill } from "@/components/expedition/copy";
import type { EpisodeJourney, JourneyEpisodeSummary } from "@/lib/story/journey";

function statusLabel(
  status: JourneyEpisodeSummary["status"],
  copy: ReturnType<typeof expeditionCopy>,
): { label: string; className: string } {
  if (status === "completed") {
    return {
      label: copy.completed,
      className: "bg-exp-primary-fixed text-exp-on-primary-container",
    };
  }
  if (status === "active") {
    return { label: copy.inProgress, className: "bg-exp-secondary-fixed text-exp-secondary" };
  }
  if (status === "available") {
    return {
      label: copy.newLabel,
      className: "bg-exp-tertiary-fixed text-exp-on-tertiary-fixed",
    };
  }
  return {
    label: copy.lockedEpisode,
    className: "bg-exp-container-high text-exp-on-surface-variant",
  };
}

export function StoryHub({
  journey,
  lang,
  locked = false,
}: {
  journey: EpisodeJourney;
  lang: string;
  locked?: boolean;
}) {
  const copy = expeditionCopy(lang);
  const current = journey.current;
  if (!current) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="exp-card p-10">
          <p className="text-lg font-extrabold">{copy.noQuestions}</p>
          <p className="mt-2 text-sm text-exp-on-surface-variant">{copy.noQuestionsBody}</p>
        </div>
      </div>
    );
  }

  const episodeComplete = current.completed >= current.total && current.total > 0;
  const next = journey.next;
  const nextOpen = next && next.status !== "locked";
  const primarySceneId =
    episodeComplete && nextOpen ? (next.resumeSceneId ?? next.firstSceneId) : current.resumeSceneId;
  const primaryHref = locked
    ? `/${lang}/stories/${journey.world.id}/${current.id}`
    : primarySceneId
      ? `/${lang}/reader/${primarySceneId}`
      : `/${lang}/stories/${journey.world.id}/${current.id}`;
  const primaryLabel = locked
    ? copy.studyToUnlock
    : primarySceneId
      ? episodeComplete
        ? copy.openNextEpisode
        : current.completed > 0
          ? copy.continueEpisode
          : copy.startEpisode
      : copy.episodeJourney;
  const episodePercent =
    current.total === 0 ? 0 : Math.round((current.completed / current.total) * 100);
  const windowStart = Math.max(
    0,
    Math.min(
      journey.episodes.findIndex((episode) => episode.id === current.id) - 1,
      Math.max(0, journey.episodes.length - 6),
    ),
  );
  const episodes = journey.episodes.slice(windowStart, windowStart + 6);
  const unlockedPercent =
    journey.totalEpisodes === 0
      ? 0
      : Math.round((journey.unlockedEpisodes / journey.totalEpisodes) * 100);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-exp-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.interactive}
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {journey.world.nativeTitle || journey.world.title}
          </h1>
          <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-exp-on-surface-variant sm:text-sm">
            {journey.world.logline}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
            {journey.levelCode} · {journey.levelLabel}
          </span>
          <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
            <Trophy className="h-3.5 w-3.5 text-exp-secondary" aria-hidden="true" />
            {journey.completedEpisodes}/{journey.totalEpisodes} {copy.episodes}
          </span>
          <Link href={`/${lang}/stories`} className="exp-btn exp-btn-soft text-xs">
            {copy.library}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {locked && current.gate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-exp-secondary/40 bg-exp-secondary-fixed/60 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-exp-surface-lowest text-exp-secondary shadow-sm">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-exp-secondary">
                {copy.episodeLocked} · {current.nativeTitle}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold leading-5 text-exp-on-surface-variant">
                {fill(copy.unlockRequirement, {
                  remaining: current.gate.remaining,
                  episode: current.gate.previousTitle,
                })}
              </p>
            </div>
          </div>
          <Link
            href={`/${lang}/stories/${journey.world.id}/${current.gate.previousEpisodeId}`}
            className="exp-btn exp-btn-primary text-xs"
          >
            {copy.continueEpisode}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        {/* Main column */}
        <div className="flex flex-col gap-5 xl:col-span-8">
          {/* Continue hero */}
          <div className="overflow-hidden rounded-2xl bg-exp-surface-lowest shadow-md">
            <StoryArtwork
              variant="city"
              variantSeed={current.id}
              palette={journey.world.palette}
              setting={journey.world.setting}
              worldId={journey.world.id}
              className="h-[280px] w-full sm:h-[340px]"
              overlay={false}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface via-exp-inverse-surface/35 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-inverse-surface/80 px-3 py-1.5 text-[10px] font-extrabold text-exp-inverse-on-surface backdrop-blur">
                    <Compass className="h-3.5 w-3.5 text-exp-secondary-container" aria-hidden="true" />
                    {current.arcNativeTitle} ·{" "}
                    {fill(copy.episodeNo, { number: current.episodeNo })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-exp-surface-lowest/90 px-3 py-1.5 text-[10px] font-extrabold text-exp-primary backdrop-blur">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {current.total} × {copy.scenes}
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-exp-on-primary">
                  <h2 className="max-w-2xl text-2xl font-extrabold leading-tight drop-shadow sm:text-3xl">
                    {current.nativeTitle || current.title}
                  </h2>
                  <p className="line-clamp-2 max-w-2xl text-xs font-medium leading-5 text-exp-container-high sm:text-sm">
                    {current.hook}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="exp-pill bg-exp-surface-lowest/95 text-exp-on-primary">
                      <CheckCircle2 className="h-3.5 w-3.5 text-exp-primary" aria-hidden="true" />
                      {fill(copy.partProgress, {
                        done: current.completed,
                        total: current.total,
                      })}
                    </span>
                    {episodeComplete ? (
                      <span className="exp-pill bg-exp-primary text-exp-on-primary">
                        <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        {copy.completed}
                      </span>
                    ) : (
                      <span className="exp-pill bg-exp-secondary-container text-exp-on-secondary-container">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {episodePercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </StoryArtwork>

            <div className="flex flex-col gap-3 bg-exp-surface-low p-4 sm:p-5">
              <div className="exp-progress">
                <span style={{ width: `${episodePercent}%` }} />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 exp-scroll-hide">
                  {current.scenes.map((scene) => (
                    <Link
                      key={scene.id}
                      href={`/${lang}/reader/${scene.id}`}
                      title={scene.title}
                      aria-current={scene.id === current.resumeSceneId ? "page" : undefined}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-extrabold transition-transform hover:-translate-y-0.5 ${
                        scene.id === current.resumeSceneId
                          ? "bg-exp-primary text-exp-on-primary shadow-[0_3px_0_var(--exp-primary)]"
                          : scene.completed
                            ? "bg-exp-primary-fixed text-exp-on-primary-container"
                            : "bg-exp-surface-lowest text-exp-on-surface-variant shadow-sm"
                      }`}
                    >
                      {scene.completed && scene.id !== current.resumeSceneId ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        scene.sceneNo
                      )}
                    </Link>
                  ))}
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                  <Link
                    href={`/${lang}/stories/${journey.world.id}/${current.id}`}
                    className="exp-btn exp-btn-ghost w-full justify-center text-xs sm:w-auto"
                  >
                    {copy.episodeJourney}
                  </Link>
                  <Link
                    href={primaryHref}
                    className="exp-btn exp-btn-primary w-full justify-center text-xs sm:w-auto"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Episode rail */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-lg font-extrabold">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-exp-primary/10 text-exp-primary">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </span>
                {copy.episodeJourney}
              </h3>
              <Link
                href={`/${lang}/stories/${journey.world.id}`}
                className="flex items-center gap-0.5 text-xs font-extrabold text-exp-primary hover:underline"
              >
                {copy.seeAll}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {episodes.map((episode) => {
                const badge = statusLabel(episode.status, copy);
                const isCurrent = episode.id === current.id;
                const body = (
                  <>
                    <div className="relative h-24 w-full overflow-hidden">
                      <StoryArtwork
                        variantSeed={episode.id}
                        palette={journey.world.palette}
                        setting={journey.world.setting}
                        worldId={journey.world.id}
                        className="h-full w-full"
                        overlay={false}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface/70 to-transparent" />
                        <span className="absolute left-2 top-2 rounded-full bg-exp-surface-lowest/90 px-2 py-0.5 text-[9px] font-extrabold text-exp-primary backdrop-blur">
                          {fill(copy.episodeNo, { number: episode.episodeNo })}
                        </span>
                        <span
                          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </StoryArtwork>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <p className="line-clamp-1 text-sm font-extrabold">{episode.nativeTitle}</p>
                      <p className="line-clamp-2 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
                        {episode.hook}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-exp-outline">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {episode.completed}/{episode.total}
                        </span>
                        {episode.status === "locked" && episode.gate ? (
                          <span className="text-[9px] font-bold text-exp-secondary">
                            {fill(copy.partProgress, {
                              done: episode.gate.previousCompleted,
                              total: episode.gate.previousTotal,
                            })}
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-exp-primary">
                            {episode.status === "completed"
                              ? copy.completed
                              : isCurrent
                                ? copy.continueLabel
                                : copy.openEpisode}
                            <ChevronRight className="h-3 w-3" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );

                if (episode.status === "locked") {
                  return (
                    <Link
                      key={episode.id}
                      href={`/${lang}/reader?locked=${episode.id}`}
                      className="relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-exp-container-high bg-exp-surface-low opacity-90 transition-colors hover:bg-exp-container/60"
                    >
                      <span className="pointer-events-none flex w-full flex-col">{body}</span>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={episode.id}
                    href={`/${lang}/stories/${journey.world.id}/${episode.id}`}
                    className={`flex flex-col overflow-hidden rounded-2xl bg-exp-surface-lowest shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isCurrent ? "ring-2 ring-exp-primary-container" : ""
                    }`}
                  >
                    {body}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Unlock teaser */}
          {next && (
            <section
              className={`flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                nextOpen
                  ? "bg-exp-tertiary text-exp-on-primary"
                  : "bg-exp-container text-exp-on-surface"
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                    nextOpen ? "bg-exp-on-primary/15" : "bg-exp-surface-lowest text-exp-secondary"
                  }`}
                >
                  {nextOpen ? (
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Lock className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] opacity-80">
                    {nextOpen ? copy.episodeUnlocked : copy.episodeLocked}
                  </p>
                  <p className="mt-0.5 text-sm font-extrabold leading-tight">{next.nativeTitle}</p>
                  <p
                    className={`mt-0.5 text-[11px] font-medium leading-5 ${
                      nextOpen ? "text-exp-tertiary-fixed" : "text-exp-on-surface-variant"
                    }`}
                  >
                    {nextOpen
                      ? copy.episodeUnlockedBody.replace("{episode}", next.nativeTitle)
                      : next.gate
                        ? fill(copy.unlockRequirement, {
                            remaining: next.gate.remaining,
                            episode: next.gate.previousTitle,
                          })
                        : copy.lockedEpisodeBody}
                  </p>
                </div>
              </div>
              <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                {nextOpen ? (
                  <Link
                    href={`/${lang}/stories/${journey.world.id}/${next.id}`}
                    className="exp-btn flex-1 bg-exp-surface-lowest text-exp-tertiary shadow-[0_4px_0_var(--exp-on-tertiary-fixed)] sm:flex-none"
                  >
                    {copy.openNextEpisode}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href={`/${lang}/stories/${journey.world.id}/${current.id}`}
                    className="exp-btn exp-btn-primary flex-1 sm:flex-none"
                  >
                    {copy.continueEpisode}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Side rail */}
        <aside className="flex w-full flex-col gap-4 xl:col-span-4">
          <div className="exp-card flex flex-col gap-4 p-5">
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
              <Compass className="h-4 w-4 text-exp-primary" aria-hidden="true" />
              {copy.readingJourney}
            </h3>
            <div className="flex items-center gap-3">
              <div
                className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(var(--exp-primary-container) 0 ${unlockedPercent}%, var(--exp-container-highest) ${unlockedPercent}% 100%)`,
                }}
              >
                <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-exp-surface-lowest text-center">
                  <div>
                    <p className="text-xl font-extrabold">{journey.unlockedEpisodes}</p>
                    <p className="text-[9px] font-bold uppercase text-exp-outline">
                      {copy.episodes}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-exp-primary-container" />
                  {copy.completedStat} ({journey.completedEpisodes})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-exp-secondary-container" />
                  {copy.inProgressStat} ({Math.max(0, current.completed > 0 && !episodeComplete ? 1 : 0)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-exp-container-highest" />
                  {copy.lockedBadge} ({Math.max(0, journey.totalEpisodes - journey.unlockedEpisodes)})
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-exp-primary-fixed/30 p-3 text-[11px] font-medium leading-5 text-exp-on-surface-variant">
              <strong className="font-extrabold text-exp-primary">Lango:</strong> {copy.shellTip}
            </div>
          </div>

          <div className="exp-card flex flex-col gap-3 p-5">
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
              <Mic className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
              {copy.practice}
            </h3>
            <p className="text-[11px] font-medium leading-5 text-exp-on-surface-variant">
              {copy.activeMissionDesc}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/${lang}/practice`} className="exp-btn exp-btn-primary text-xs">
                {copy.practice}
              </Link>
              <Link href={`/${lang}/vault`} className="exp-btn exp-btn-soft text-xs">
                {copy.vault}
              </Link>
            </div>
          </div>

          <div className="exp-card flex flex-col gap-3 p-5">
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
              <Trophy className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
              {copy.level}
            </h3>
            <div className="flex flex-col gap-1.5">
              {journey.levels.map((level) => (
                <Link
                  key={level.tier}
                  href={`/${lang}/reader?tier=${level.tier}`}
                  aria-current={level.tier === journey.tier ? "page" : undefined}
                  className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                    level.tier === journey.tier
                      ? "bg-exp-primary text-exp-on-primary"
                      : "bg-exp-surface-low hover:bg-exp-container"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Star
                      className={`h-3.5 w-3.5 ${
                        level.tier === journey.tier
                          ? "fill-current"
                          : "text-exp-secondary-container"
                      }`}
                      aria-hidden="true"
                    />
                    {level.levelCode} · {level.label}
                  </span>
                  <span className="text-[10px] opacity-80">
                    {level.completedEpisodes}/{level.episodes}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-exp-container p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-exp-secondary-fixed text-exp-secondary">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                {copy.streakDays}
              </p>
              <p className="text-[10px] text-exp-on-surface-variant">{copy.weeklyChallengeBody}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
