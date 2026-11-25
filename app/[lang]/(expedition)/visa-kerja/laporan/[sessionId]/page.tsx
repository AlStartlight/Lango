import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Target,
} from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { getInterviewTracks } from "@/lib/interview/content";
import { getInterviewSession } from "@/lib/interview/repository";
import {
  INTERVIEW_DIMENSIONS,
  type InterviewBand,
  type InterviewFeedbackCode,
  type InterviewQuestion,
  type InterviewScores,
} from "@/lib/interview/types";
import { interviewCopy, interviewFill } from "@/components/interview/interview-copy";
import { BandPill, ReadinessRing, ScoreBars } from "@/components/interview/ui";
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

function averageScores(scores: InterviewScores[]): InterviewScores | null {
  if (scores.length === 0) return null;
  const totals = {
    content: 0,
    structure: 0,
    evidence: 0,
    language: 0,
    delivery: 0,
  };
  for (const score of scores) {
    for (const dimension of INTERVIEW_DIMENSIONS) {
      totals[dimension] += score[dimension];
    }
  }
  return {
    content: Math.round((totals.content / scores.length) * 10) / 10,
    structure: Math.round((totals.structure / scores.length) * 10) / 10,
    evidence: Math.round((totals.evidence / scores.length) * 10) / 10,
    language: Math.round((totals.language / scores.length) * 10) / 10,
    delivery: Math.round((totals.delivery / scores.length) * 10) / 10,
  };
}

function rankCodes(
  turns: Array<{
    feedback: {
      strengths: InterviewFeedbackCode[];
      improvements: InterviewFeedbackCode[];
    };
  }>,
  key: "strengths" | "improvements",
): InterviewFeedbackCode[] {
  const counts = new Map<InterviewFeedbackCode, number>();
  for (const turn of turns) {
    for (const code of turn.feedback[key]) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([code]) => code)
    .slice(0, 4);
}

export default async function InterviewReportPage({
  params,
}: {
  params: Promise<{ lang: string; sessionId: string }>;
}) {
  const { lang, sessionId } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const session = await getInterviewSession(context.user.id, sessionId);
  if (!session) notFound();
  if (!session.completedAt) {
    redirect(`/${lang}/visa-kerja/sesi/${session.id}`);
  }

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const locale = normalizeLocale(uiLocale);
  const copy = interviewCopy(locale);
  const track = getInterviewTracks().find((entry) => entry.id === session.track);
  const trackLabel = track?.label[locale] ?? session.track;
  const questionById = new Map<string, InterviewQuestion>(
    session.questions.map((question) => [question.canonicalId, question]),
  );
  const averages = averageScores(session.turns.map((turn) => turn.scores));
  const strengths = rankCodes(session.turns, "strengths");
  const improvements = rankCodes(session.turns, "improvements");
  const weakest = [...session.turns].sort(
    (left, right) => left.readiness - right.readiness,
  )[0];
  const weakestQuestion = weakest
    ? questionById.get(weakest.questionId)
    : undefined;
  const band = (session.band as InterviewBand | null) ?? "not_ready";
  const date = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : locale === "ja" ? "ja-JP" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: context.user.timezone,
    },
  ).format(new Date(session.startedAt));
  const minutes = Math.max(
    1,
    Math.round(
      session.turns.reduce((total, turn) => total + turn.durationMs, 0) / 60_000,
    ),
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/${lang}/visa-kerja?language=${session.language}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-exp-on-surface-variant hover:text-exp-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.backToSessions}
        </Link>
        <span className="exp-pill bg-exp-container text-exp-on-surface">
          {session.mode === "simulation"
            ? copy.simulationLabel
            : copy.drillLabel}
        </span>
      </div>

      <section className="rounded-3xl bg-exp-surface-lowest p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
              {copy.reportTitle}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-exp-on-surface sm:text-3xl">
              {trackLabel}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-exp-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {interviewFill(copy.minutes, { count: minutes })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                +{session.xpAwarded} XP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-exp-surface-low p-3">
            <ReadinessRing
              value={session.readiness}
              label={copy.readiness}
              size={112}
            />
            <div>
              <BandPill band={band} label={copy.band[band]} />
              <p className="mt-2 max-w-40 text-[10px] font-semibold leading-4 text-exp-outline">
                {copy.aggregateNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <section className="flex-1 rounded-2xl bg-exp-surface-lowest p-4 shadow-sm">
          <h2 className="text-sm font-extrabold text-exp-on-surface">
            {copy.dimensions}
          </h2>
          <div className="mt-3">
            {averages ? (
              <ScoreBars
                scores={{
                  content: Math.round(averages.content),
                  structure: Math.round(averages.structure),
                  evidence: Math.round(averages.evidence),
                  language: Math.round(averages.language),
                  delivery: Math.round(averages.delivery),
                }}
                labels={copy.dimension}
              />
            ) : (
              <p className="text-xs font-semibold text-exp-outline">
                {copy.noTurns}
              </p>
            )}
          </div>
        </section>

        <section className="flex-1 rounded-2xl bg-exp-surface-lowest p-4 shadow-sm">
          <h2 className="text-sm font-extrabold text-exp-on-surface">
            {copy.strengths}
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {strengths.length === 0 && (
              <li className="text-xs font-semibold text-exp-outline">—</li>
            )}
            {strengths.map((code) => (
              <li
                key={code}
                className="rounded-xl bg-exp-primary-container/40 px-3 py-2 text-xs font-semibold leading-5 text-exp-on-surface"
              >
                {copy.feedback[code]}
              </li>
            ))}
          </ul>
          <h2 className="mt-4 text-sm font-extrabold text-exp-on-surface">
            {copy.improvements}
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {improvements.length === 0 && (
              <li className="text-xs font-semibold text-exp-outline">—</li>
            )}
            {improvements.map((code) => (
              <li
                key={code}
                className="rounded-xl bg-exp-error/10 px-3 py-2 text-xs font-semibold leading-5 text-exp-on-surface"
              >
                {copy.feedback[code]}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {weakestQuestion && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-exp-secondary-fixed p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
              {copy.nextStep}
            </p>
            <p className="mt-1 text-sm font-extrabold text-exp-on-surface">
              {weakestQuestion.prompt}
            </p>
          </div>
          <StartSessionButton
            lang={lang}
            language={session.language}
            track={weakestQuestion.track}
            mode="drill"
            label={copy.retryWeak}
            tone="primary"
          />
        </section>
      )}

      <section className="flex flex-col gap-3">
        {session.turns.length === 0 && (
          <p className="rounded-2xl bg-exp-surface-lowest p-5 text-sm font-semibold text-exp-on-surface-variant">
            {copy.noTurns}
          </p>
        )}
        {session.turns.map((turn, turnIndex) => {
          const question = questionById.get(turn.questionId);
          if (!question) return null;
          return (
            <article
              key={turn.id}
              className="rounded-2xl bg-exp-surface-lowest p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
                    {interviewFill(copy.questionOf, {
                      current: turnIndex + 1,
                      total: session.turns.length,
                    })}
                  </p>
                  <h3 className="mt-1 text-sm font-extrabold leading-6 text-exp-on-surface">
                    {question.prompt}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Target
                    className="h-3.5 w-3.5 text-exp-secondary"
                    aria-hidden="true"
                  />
                  <span className="rounded-full bg-exp-primary-container px-2 py-1 text-[11px] font-extrabold text-exp-on-primary-container">
                    {turn.readiness}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-exp-surface-low p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                    {copy.transcript}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-xs leading-6 text-exp-on-surface">
                    {turn.transcript}
                  </p>
                  <p className="mt-2 text-[10px] font-bold text-exp-outline">
                    {interviewFill(copy.words, { count: turn.metrics.words })} ·{" "}
                    {interviewFill(copy.seconds, {
                      count: turn.metrics.estimatedSeconds,
                    })}
                  </p>
                </div>
                <div className="rounded-xl bg-exp-surface-low p-3">
                  <ScoreBars scores={turn.scores} labels={copy.dimension} />
                </div>
              </div>

              {(turn.feedback.strengths.length > 0 ||
                turn.feedback.improvements.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {turn.feedback.strengths.slice(0, 2).map((code) => (
                    <span
                      key={code}
                      className="rounded-full bg-exp-primary-container px-2.5 py-1 text-[10px] font-bold text-exp-on-primary-container"
                    >
                      {copy.feedback[code]}
                    </span>
                  ))}
                  {turn.feedback.improvements.slice(0, 2).map((code) => (
                    <span
                      key={code}
                      className="rounded-full bg-exp-container-high px-2.5 py-1 text-[10px] font-bold text-exp-on-surface-variant"
                    >
                      {copy.feedback[code]}
                    </span>
                  ))}
                </div>
              )}

              <details className="mt-3 rounded-xl bg-exp-surface-low px-3 py-2">
                <summary className="cursor-pointer text-[11px] font-extrabold text-exp-on-surface-variant">
                  {copy.modelAnswer}
                </summary>
                <div className="mt-2 grid gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                      {copy.skeleton}
                    </p>
                    <ol className="mt-1 list-decimal space-y-1 pl-4 text-xs leading-5 text-exp-on-surface-variant">
                      {question.skeleton.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <p className="whitespace-pre-line text-xs leading-6 text-exp-on-surface">
                    {question.modelAnswer}
                  </p>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-error">
                      {copy.redFlags}
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-exp-on-surface-variant">
                      {question.redFlags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="rounded-xl bg-exp-secondary-fixed px-3 py-2 text-xs leading-5 text-exp-on-surface-variant">
                    {question.culturalNote}
                  </p>
                </div>
              </details>
            </article>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/${lang}/visa-kerja?language=${session.language}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-exp-primary hover:underline"
        >
          {copy.startNew}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <StartSessionButton
          lang={lang}
          language={session.language}
          track={session.track}
          mode="simulation"
          label={copy.startSimulation}
          tone="outline"
        />
      </div>
    </div>
  );
}
