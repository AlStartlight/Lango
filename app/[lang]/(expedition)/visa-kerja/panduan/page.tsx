import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, ShieldAlert } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import {
  getInterviewCatalog,
  getInterviewQuestions,
  getInterviewQuestionsForTrack,
  isInterviewLanguage,
} from "@/lib/interview/content";
import {
  INTERVIEW_TRACK_IDS,
  type InterviewLanguage,
  type InterviewTrackId,
} from "@/lib/interview/types";
import { interviewCopy } from "@/components/interview/interview-copy";
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

export default async function InterviewGuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ language?: string; track?: string }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = interviewCopy(normalizeLocale(uiLocale));
  const preferred = resolveContentLanguage(context.user.targetLanguage, uiLocale);
  const language: InterviewLanguage =
    (isInterviewLanguage(query.language) ? query.language : null) ??
    (isInterviewLanguage(preferred) ? preferred : "en");
  const selectedTrack =
    query.track && (INTERVIEW_TRACK_IDS as readonly string[]).includes(query.track)
      ? (query.track as InterviewTrackId)
      : null;

  const catalog = getInterviewCatalog(language);
  const groups = catalog.tracks
    .filter((track) => (selectedTrack ? track.id === selectedTrack : true))
    .map((track) => ({
      ...track,
      questions: selectedTrack
        ? getInterviewQuestionsForTrack(language, track.id)
        : getInterviewQuestions(language).filter(
            (question) => question.track === track.id,
          ),
    }))
    .filter((group) => group.questions.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
      <div>
        <Link
          href={`/${lang}/visa-kerja?language=${language}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-exp-on-surface-variant hover:text-exp-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.backToHub}
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-exp-primary-container text-exp-on-primary-container">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-exp-on-surface">
              {copy.guideTitle}
            </h1>
            <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-exp-on-surface-variant">
              {copy.guideIntro}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.draftNote}
            </p>
          </div>
        </div>
      </div>

      {groups.length === 0 && (
        <p className="rounded-2xl bg-exp-surface-lowest p-5 text-sm font-semibold text-exp-on-surface-variant">
          {copy.guideEmpty}
        </p>
      )}

      {groups.map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-exp-on-surface-variant">
              {group.label[normalizeLocale(uiLocale)]}
            </h2>
            <Link
              href={`/${lang}/visa-kerja?language=${language}`}
              className="text-[11px] font-extrabold text-exp-primary hover:underline"
            >
              {copy.practice}
            </Link>
          </div>

          {group.questions.map((question) => (
            <article
              key={question.canonicalId}
              className="rounded-2xl bg-exp-surface-lowest p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold leading-6 text-exp-on-surface">
                    {question.prompt}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-exp-on-surface-variant">
                    {question.translation}
                  </p>
                  {question.romanization && (
                    <p className="mt-1 text-[11px] italic text-exp-outline">
                      {question.romanization}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-exp-container px-2 py-0.5 text-[10px] font-extrabold text-exp-on-surface-variant">
                  {question.level}
                </span>
              </div>

              <details className="mt-3 rounded-xl bg-exp-surface-low px-3 py-2">
                <summary className="cursor-pointer text-[11px] font-extrabold text-exp-on-surface-variant">
                  {copy.showAnswer}
                </summary>
                <div className="mt-3 grid gap-4">
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
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                      {copy.modelAnswer}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-xs leading-6 text-exp-on-surface">
                      {question.modelAnswer}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                      {copy.keyPhrases}
                    </p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {question.keyPhrases.map((phrase) => (
                        <li key={phrase.target} className="text-xs leading-5">
                          <span className="font-extrabold text-exp-on-surface">
                            {phrase.target}
                          </span>
                          <span className="text-exp-on-surface-variant">
                            {" "}
                            — {phrase.note}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  <div className="rounded-xl bg-exp-secondary-fixed px-3 py-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
                      {copy.culturalNote}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-exp-on-surface-variant">
                      {question.culturalNote}
                    </p>
                  </div>
                </div>
              </details>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-exp-outline">
                  {question.competencies.map((item) => item.replaceAll("_", " ")).join(" · ")}
                </span>
                <StartSessionButton
                  lang={lang}
                  language={language}
                  track={question.track}
                  mode="drill"
                  label={copy.practiceThis}
                  tone="outline"
                />
              </div>
            </article>
          ))}
        </section>
      ))}

      <Link
        href={`/${lang}/visa-kerja?language=${language}`}
        className="inline-flex items-center gap-1 text-xs font-extrabold text-exp-primary hover:underline"
      >
        {copy.startNew}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
