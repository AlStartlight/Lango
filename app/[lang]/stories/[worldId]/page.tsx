import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, ChevronRight, Compass, Lock, MapPin, Play, Users } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { getWorldDetail } from "@/lib/story/repository";
import { StoryShell } from "@/components/story/story-shell";
import { expeditionCopy, fill } from "@/components/expedition/copy";
import { StoryArtwork } from "@/components/expedition/art";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function WorldPage({
  params,
}: {
  params: Promise<{ lang: string; worldId: string }>;
}) {
  const { lang, worldId } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = expeditionCopy(uiLocale);
  const detail = await getWorldDetail(context.user.id, worldId);
  if (!detail) notFound();
  const start = detail.currentSceneId ?? detail.startSceneId;

  return (
    <StoryShell lang={lang} active="library">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
          <Link href={`/${lang}/stories`} className="hover:text-exp-primary">
            {copy.library}
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span>{detail.world.title}</span>
        </div>

        <StoryArtwork
          variant="shrine"
          palette={detail.world.palette}
          setting={detail.world.setting}
          worldId={detail.world.id}
          className="relative min-h-64 w-full rounded-2xl"
        >
          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="exp-pill bg-exp-secondary-container text-exp-on-secondary-container">
                {detail.world.era}
              </span>
              <span className="exp-pill bg-exp-surface-lowest/90 text-exp-primary backdrop-blur">
                {detail.world.tone}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold leading-tight text-exp-on-primary drop-shadow sm:text-4xl">
                {detail.world.nativeTitle}
              </h1>
              <p className="mt-1 text-xs font-bold text-exp-container-high">{detail.world.title}</p>
              <p className="mt-2 max-w-3xl text-xs font-medium leading-5 text-exp-container sm:text-sm">
                {detail.world.logline}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {detail.world.motifs.slice(0, 6).map((motif) => (
                  <span
                    key={motif}
                    className="rounded-full bg-exp-surface-lowest/20 px-2.5 py-1 text-[9px] font-bold text-exp-on-primary backdrop-blur"
                  >
                    {motif}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </StoryArtwork>

        <div className="exp-card flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-exp-primary-container/20 text-exp-primary">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                  {copy.currentLocation}
                </p>
                <p className="text-sm font-bold">{detail.world.setting}</p>
              </div>
            </div>
            <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
              {detail.completed}/{detail.total} {copy.scenes} · {detail.percent}%
            </span>
          </div>
          <div className="exp-progress">
            <span style={{ width: `${detail.percent}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={start ? `/${lang}/reader/${start}` : `/${lang}/stories`} className="exp-btn exp-btn-primary">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              {detail.completed > 0 ? copy.continueReading : copy.startReading}
            </Link>
            <Link href={`/${lang}/stories/${worldId}/characters`} className="exp-btn exp-btn-ghost">
              <Users className="h-4 w-4" aria-hidden="true" />
              {copy.studyBuddies}
            </Link>
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-extrabold">{copy.level}</h2>
          {detail.levels.map((level, levelIndex) => (
            <div key={level.tier} className="exp-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-exp-container-high px-4 py-3">
                <div>
                  <p className="text-sm font-extrabold">{level.label}</p>
                  <p className="text-[10px] font-semibold text-exp-on-surface-variant">
                    {level.framework} · {level.arcs.length} arcs
                  </p>
                </div>
                <span className="exp-pill bg-exp-container text-exp-on-surface-variant">
                  {level.tier}
                </span>
              </div>
              <div className="divide-y divide-exp-container-high">
                {level.arcs.map((arc, index) => (
                  <details key={arc.id} className="group px-4 py-3" open={levelIndex === 0 && index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {arc.nativeTitle}{" "}
                          <span className="text-[11px] font-normal text-exp-on-surface-variant">
                            · {arc.title}
                          </span>
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-exp-outline">
                          {arc.synopsis}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-exp-outline transition-transform group-open:rotate-90" aria-hidden="true" />
                    </summary>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {arc.episodes.map((episode) => {
                        const done = episode.scenes > 0 && episode.completed >= episode.scenes;
                        const locked = episode.status === "locked";
                        return (
                          <Link
                            key={episode.id}
                            href={`/${lang}/stories/${worldId}/${episode.id}`}
                            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                              locked
                                ? "bg-exp-surface-low/50 opacity-70 hover:bg-exp-container/60"
                                : "bg-exp-surface-low hover:bg-exp-container"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold">
                                {episode.nativeTitle}
                              </span>
                              <span className="block truncate text-[10px] text-exp-outline">
                                {fill(copy.episodeCount, { count: episode.scenes })} ·{" "}
                                {episode.completed}/{episode.scenes}
                              </span>
                            </span>
                            {locked ? (
                              <span className="shrink-0 rounded-full bg-exp-container-high px-2 py-0.5 text-[9px] font-extrabold text-exp-on-surface-variant">
                                <Lock className="mr-0.5 inline h-3 w-3" aria-hidden="true" />
                                {copy.lockedEpisode}
                              </span>
                            ) : done ? (
                              <span className="shrink-0 rounded-full bg-exp-primary-container px-2 py-0.5 text-[9px] font-extrabold text-exp-on-primary-container">
                                {copy.completed}
                              </span>
                            ) : (
                              <BookOpen className="h-4 w-4 shrink-0 text-exp-outline" aria-hidden="true" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="flex items-center justify-between rounded-2xl bg-exp-container p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-exp-on-surface-variant">
            <Compass className="h-4 w-4 text-exp-primary" aria-hidden="true" />
            {copy.shellTip}
          </div>
          <Link href={`/${lang}/stories`} className="shrink-0 text-xs font-extrabold text-exp-primary hover:underline">
            {copy.backToLibrary}
          </Link>
        </div>
      </div>
    </StoryShell>
  );
}
