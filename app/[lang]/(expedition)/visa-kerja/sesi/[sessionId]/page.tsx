import { notFound, redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { getInterviewTracks } from "@/lib/interview/content";
import { getInterviewSession } from "@/lib/interview/repository";
import { toPublicQuestion } from "@/lib/interview/types";
import { InterviewRunner } from "@/components/interview/interview-runner";
import { FinishSessionButton } from "@/components/interview/finish-session-button";
import { interviewCopy } from "@/components/interview/interview-copy";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ lang: string; sessionId: string }>;
}) {
  const { lang, sessionId } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const session = await getInterviewSession(context.user.id, sessionId);
  if (!session) notFound();
  if (session.completedAt) {
    redirect(`/${lang}/visa-kerja/laporan/${session.id}`);
  }

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const locale = uiLocale === "id" ? "id" : uiLocale === "jp" ? "ja" : "en";
  const track = getInterviewTracks().find((entry) => entry.id === session.track);
  const copy = interviewCopy(locale);

  if (session.turns.length >= session.questions.length) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-10">
        <div className="rounded-3xl bg-exp-surface-lowest p-6 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-exp-secondary">
            {copy.sessionTitle}
          </p>
          <h1 className="mt-1 text-xl font-extrabold text-exp-on-surface">
            {track?.label[locale] ?? session.track}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-exp-on-surface-variant">
            {copy.allAnswered}
          </p>
          <div className="mt-4">
            <FinishSessionButton
              lang={lang}
              sessionId={session.id}
              label={copy.finish}
              errorLabel={copy.submitFailed}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <InterviewRunner
      lang={lang}
      locale={locale}
      language={session.language}
      sessionId={session.id}
      trackLabel={track?.label[locale] ?? session.track}
      mode={session.mode}
      questions={session.questions.map(toPublicQuestion)}
      initialTurns={session.turns}
    />
  );
}
