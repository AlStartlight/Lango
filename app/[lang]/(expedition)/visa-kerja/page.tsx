import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Clock,
  FileText,
  Mic,
  ShieldCheck,
  Target,
} from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import {
  CONTENT_LANGUAGE_ENGLISH_LABELS,
  isUiLocale,
  resolveContentLanguage,
} from "@/lib/i18n/locales";
import {
  getInterviewCatalog,
  getInterviewLanguageAvailability,
  isInterviewLanguage,
} from "@/lib/interview/content";
import { getInterviewOverview } from "@/lib/interview/repository";
import type { InterviewLanguage } from "@/lib/interview/types";
import { interviewCopy, interviewFill } from "@/components/interview/interview-copy";
import { BandPill, ReadinessRing } from "@/components/interview/ui";
import { StartSessionButton } from "@/components/interview/start-session-button";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

function normalizeLocale(value: string): "id" | "en" | "ja" {
  if (value === "id") return "id";
  if (value === "ja" || value === "jp") return "ja";
  return "en";
}

export default async function VisaKerjaPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ language?: string }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = interviewCopy(normalizeLocale(uiLocale));
  const requested = isInterviewLanguage(query.language)
    ? query.language
    : null;
  const preferred = resolveContentLanguage(context.user.targetLanguage, uiLocale);
  const language: InterviewLanguage =
    requested ??
    (isInterviewLanguage(preferred) ? preferred : "en");

  const catalog = getInterviewCatalog(language);
  const overview = await getInterviewOverview(context.user.id, language);
  const availability = getInterviewLanguageAvailability();
  const delta =
    overview.lastReadiness !== null && overview.previousReadiness !== null
      ? overview.lastReadiness - overview.previousReadiness
      : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
      <section className="relative overflow-hidden rounded-3xl bg-exp-primary-container p-5 text-exp-on-primary-container sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="exp-pill bg-exp-surface-lowest/80 text-exp-on-surface">
                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.kicker}
              </span>
              <span className="rounded-full bg-exp-inverse-surface/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide">
                {catalog.status} · {catalog.total} Q
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-exp-on-primary-container/85">
              {copy.intro}
            </p>
            <p className="mt-3 max-w-2xl text-[11px] font-semibold leading-5 text-exp-on-primary-container/70">
              {copy.hubDisclaimer}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-exp-surface-lowest/85 p-3">
            <ReadinessRing
              value={overview.lastReadiness}
              label={copy.readiness}
              size={112}
            />
            <div className="min-w-0">
              <BandPill
                band={overview.bandForLast ?? null}
                label={
                  overview.lastReadiness === null
                    ? copy.noReadiness
                    : copy.band[(overview.bandForLast ?? "not_ready") as keyof typeof copy.band]
                }
              />
              <p className="mt-2 text-xs font-extrabold text-exp-on-surface">
                {interviewFill(copy.sessions, { count: overview.completedCount })}
              </p>
              <p className="text-xs font-semibold text-exp-on-surface-variant">
                {interviewFill(copy.turns, { count: overview.totalTurns })}
              </p>
              {delta !== null && delta !== 0 && (
                <p
                  className={`mt-1 text-[10px] font-extrabold ${
                    delta > 0 ? "text-exp-secondary" : "text-exp-error"
                  }`}
                >
                  {interviewFill(delta > 0 ? copy.deltaUp : copy.deltaDown, {
                    delta: Math.abs(delta),
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
          {copy.language}
        </span>
        {availability.map((entry) => (
          <Link
            key={entry.code}
            href={`/${lang}/visa-kerja?language=${entry.code}`}
            aria-current={entry.code === language ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
              entry.code === language
                ? "bg-exp-primary text-exp-on-primary"
                : "bg-exp-surface-lowest text-exp-on-surface-variant hover:bg-exp-container"
            }`}
          >
            {CONTENT_LANGUAGE_ENGLISH_LABELS[entry.code]} · {entry.count}
          </Link>
        ))}
        <Link
          href={`/${lang}/visa-kerja/panduan?language=${language}`}
          className="mt-1 inline-flex w-full items-center gap-1 text-[11px] font-extrabold text-exp-primary hover:underline sm:mt-0 sm:ml-auto sm:w-auto"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.guide}
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Target, title: copy.tracks, body: copy.modeDrillDesc },
          { icon: Mic, title: copy.modeSimulation, body: copy.modeSimulationDesc },
          { icon: FileText, title: copy.reportTitle, body: copy.aggregateNote },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl bg-exp-surface-lowest p-4 shadow-sm"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-exp-container text-exp-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-2 text-xs font-extrabold text-exp-on-surface">
                {item.title}
              </p>
              <p className="mt-1 text-[11px] font-semibold leading-5 text-exp-on-surface-variant">
                {item.body}
              </p>
            </div>
          );
        })}
      </section>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
            {copy.tracks}
          </h2>
          <span className="text-[10px] font-bold text-exp-outline">
            {copy.draftNote}
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {catalog.tracks.map((track) => (
            <article
              key={track.id}
              className="flex flex-col justify-between gap-3 rounded-2xl bg-exp-surface-lowest p-4 shadow-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-exp-on-surface">
                    {track.label[normalizeLocale(uiLocale)]}
                  </h3>
                  <span className="rounded-full bg-exp-container px-2 py-0.5 text-[10px] font-extrabold text-exp-on-surface-variant">
                    {track.level}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-exp-outline">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {interviewFill(copy.minutes, { count: track.minutes })}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-exp-on-surface-variant">
                  {interviewFill(copy.questionsCount, { count: track.count })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StartSessionButton
                    lang={lang}
                    language={language}
                    track={track.id}
                    mode="drill"
                    label={copy.startDrill}
                    tone="primary"
                  />
                  <StartSessionButton
                    lang={lang}
                    language={language}
                    track={track.id}
                    mode="simulation"
                    label={copy.startSimulation}
                    tone="outline"
                  />
                </div>
              </div>
              <Link
                href={`/${lang}/visa-kerja/panduan?language=${language}&track=${track.id}`}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-exp-primary hover:underline"
              >
                {copy.guide}
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-exp-surface-lowest p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-exp-on-surface">
            {copy.recent}
          </h2>
          <ShieldCheck className="h-4 w-4 text-exp-secondary" aria-hidden="true" />
        </div>
        {overview.sessions.length === 0 ? (
          <p className="mt-2 text-xs font-semibold leading-5 text-exp-on-surface-variant">
            {copy.emptyRecent}
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {overview.sessions.map((session) => {
              const track = catalog.tracks.find(
                (entry) => entry.id === session.track,
              );
              const date = new Intl.DateTimeFormat(
                normalizeLocale(uiLocale) === "id" ? "id-ID" : normalizeLocale(uiLocale) === "ja" ? "ja-JP" : "en-US",
                { dateStyle: "medium", timeStyle: "short" },
              ).format(new Date(session.startedAt));
              const bandLabel =
                session.readiness === null
                  ? session.completedAt === null
                    ? copy.inProgress
                    : copy.noReadiness
                  : copy.band[
                      (session.band as keyof typeof copy.band) ?? "not_ready"
                    ];
              return (
                <li key={session.id}>
                  <Link
                    href={
                      session.completedAt
                        ? `/${lang}/visa-kerja/laporan/${session.id}`
                        : `/${lang}/visa-kerja/sesi/${session.id}`
                    }
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-exp-surface-low px-3 py-2.5 hover:bg-exp-container"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-extrabold text-exp-on-surface">
                        {track?.label[normalizeLocale(uiLocale)] ?? session.track}
                      </span>
                      <span className="text-[10px] font-semibold text-exp-outline">
                        {date} · {interviewFill(copy.turns, { count: session.turns })}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-exp-on-surface-variant">
                        {bandLabel}
                      </span>
                      <span className="rounded-full bg-exp-primary-container px-2 py-1 text-[11px] font-extrabold text-exp-on-primary-container">
                        {session.readiness === null ? "—" : session.readiness}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
