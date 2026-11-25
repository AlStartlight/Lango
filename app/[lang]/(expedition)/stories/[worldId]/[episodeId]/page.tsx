import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, BookOpen, Check, ChevronRight, Clock, Compass, Lock, Play, Star } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { getEpisodeDetail } from "@/lib/story/repository";
import { getEpisodeJourney } from "@/lib/story/journey";
import { expeditionCopy, fill } from "@/components/expedition/copy";
import { StoryArtwork } from "@/components/expedition/art";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ lang: string; worldId: string; episodeId: string }>;
}) {
  const { lang, worldId, episodeId } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = expeditionCopy(uiLocale);
  const expedition = copy;
  const detail = await getEpisodeDetail(context.user.id, episodeId);
  if (!detail || detail.content.world.id !== worldId) notFound();
  const journey = await getEpisodeJourney(context.user.id, {
    language: detail.content.language,
    episodeId,
  });
  const gate = journey?.current?.gate ?? null;
  const locked = journey?.current?.status === "locked";
  const nextEpisode = journey?.next ?? null;
  const nextUnlocked = Boolean(nextEpisode && nextEpisode.status !== "locked");
  const firstUnread = detail.scenes.find((scene) => !scene.completed) ?? detail.scenes[0];
  const percent =
    detail.scenes.length === 0
      ? 0
      : Math.round((detail.completed / detail.scenes.length) * 100);
  const episodeComplete = detail.completed >= detail.scenes.length && detail.scenes.length > 0;

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
          <Link href={`/${lang}/stories`} className="hover:text-exp-primary">
            {copy.library}
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href={`/${lang}/stories/${worldId}`} className="hover:text-exp-primary">
            {detail.content.world.title}
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span>EP {detail.episode.episodeNo}</span>
        </div>

        <StoryArtwork
          variant="city"
          variantSeed={detail.episode.id}
          palette={detail.content.world.palette}
          setting={detail.content.world.setting}
          worldId={detail.content.world.id}
          className="relative min-h-56 w-full rounded-2xl"
        >
          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="exp-pill bg-exp-secondary-container text-exp-on-secondary-container">
                {detail.arc.nativeTitle} · {detail.arc.tier}
              </span>
              <span className="exp-pill bg-exp-surface-lowest/90 text-exp-primary backdrop-blur">
                {detail.arc.levelCode}
              </span>
            </div>
            <div>
              <h1 className="max-w-3xl text-2xl font-extrabold leading-tight text-exp-on-primary drop-shadow sm:text-4xl">
                {detail.episode.nativeTitle}
              </h1>
              <p className="mt-1 text-xs font-semibold text-exp-container-high sm:text-sm">
                {detail.episode.title}
              </p>
              <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-exp-container sm:text-sm">
                {detail.episode.hook}
              </p>
            </div>
          </div>
        </StoryArtwork>

        {locked && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-exp-secondary/40 bg-exp-secondary-fixed/60 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-exp-surface-lowest text-exp-secondary shadow-sm">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-exp-secondary">{copy.episodeLocked}</p>
                <p className="mt-0.5 text-[11px] font-semibold leading-5 text-exp-on-surface-variant">
                  {gate
                    ? fill(copy.unlockRequirement, {
                        remaining: gate.remaining,
                        episode: gate.previousTitle,
                      })
                    : copy.lockedEpisodeBody}
                </p>
              </div>
            </div>
            {gate && (
              <Link
                href={`/${lang}/stories/${worldId}/${gate.previousEpisodeId}`}
                className="exp-btn exp-btn-primary text-xs"
              >
                {copy.continueEpisode}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        <div className="exp-card flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-exp-secondary">
                {copy.checkpoint} · Recap
              </span>
              <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-exp-on-surface-variant">
                {detail.episode.recap}
              </p>
            </div>
            <Link href={`/${lang}/stories/${worldId}`} className="exp-btn exp-btn-soft text-xs">
              <Compass className="h-4 w-4" aria-hidden="true" />
              {copy.seeAll}
            </Link>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
              <span>{copy.journeyProgress}</span>
              <span className="text-exp-primary">
                {detail.completed}/{detail.scenes.length} · {percent}%
              </span>
            </div>
            <div className="exp-progress">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-exp-on-surface-variant">
              <BookOpen className="h-4 w-4 text-exp-primary" aria-hidden="true" />
              {fill(copy.episodeCount, { count: detail.scenes.length })}
            </span>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              {detail.completed > 0 && (
                <Link
                  href={`/${lang}/results/${episodeId}`}
                  className="exp-btn exp-btn-soft flex-1 sm:flex-none"
                >
                  <Star className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
                  {expedition.results}
                </Link>
              )}
              {locked ? (
                <span className="exp-btn exp-btn-soft flex-1 cursor-not-allowed opacity-70 sm:flex-none">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  {copy.lockedEpisode}
                </span>
              ) : (
                <Link
                  href={`/${lang}/reader/${firstUnread.id}`}
                  className="exp-btn exp-btn-primary flex-1 sm:flex-none"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  {detail.completed > 0 ? copy.continueReading : copy.start}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              {episodeComplete && nextEpisode && nextUnlocked && (
                <Link
                  href={`/${lang}/stories/${worldId}/${nextEpisode.id}`}
                  className="exp-btn exp-btn-amber flex-1 sm:flex-none"
                >
                  <SparklesIcon />
                  {copy.openNextEpisode}
                </Link>
              )}
            </div>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">{copy.scenes}</h2>
            <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
              {detail.scenes.length}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {detail.scenes.map((scene) => (
              <Link
                key={scene.id}
                href={`/reader/${scene.id}`}
                className="exp-card group flex items-start gap-3 p-4 transition-transform hover:-translate-y-0.5"
              >
                <span
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                    scene.completed
                      ? "bg-exp-primary-container text-exp-on-primary-container"
                      : "bg-exp-container-high text-exp-on-surface-variant"
                  }`}
                >
                  {scene.completed ? <Check className="h-4 w-4" aria-hidden="true" /> : scene.sceneNo}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold group-hover:text-exp-primary">
                    {scene.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-exp-on-surface-variant">
                    {scene.titleTranslation[uiLocale as "id" | "en" | "ja"] ??
                      scene.titleTranslation.id}{" "}
                    · {scene.minutes} {copy.minutes}
                  </span>
                  <span className="mt-1 line-clamp-1 text-[10px] text-exp-outline">
                    {scene.cliffhanger}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-exp-surface-low px-2 py-1 text-[9px] font-extrabold text-exp-on-surface-variant">
                  {locked ? (
                    <Lock className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Clock className="h-3 w-3" aria-hidden="true" />
                  )}
                  {scene.minutes}m
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path d="M8 1.5 9.5 6l4.5 1.5L9.5 9 8 13.5 6.5 9 2 7.5 6.5 6Z" fill="currentColor" />
    </svg>
  );
}
