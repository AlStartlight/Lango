import { notFound, redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { getEpisodeReport } from "@/lib/story/report";
import { StoryShell } from "@/components/story/story-shell";
import { ResultsReport } from "@/components/story/results-report";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ResultReportPage({
  params,
}: {
  params: Promise<{ lang: string; episodeId: string }>;
}) {
  const { lang, episodeId } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const explanationLocale = ["id", "en", "ja"].includes(context.user.explanationLocale)
    ? context.user.explanationLocale
    : "en";
  const report = await getEpisodeReport(
    context.user.id,
    context.user.timezone,
    episodeId,
    explanationLocale,
  );
  if (!report) notFound();

  return (
    <StoryShell lang={lang} active="results">
      <ResultsReport report={report} lang={lang} locale={uiLocale} />
    </StoryShell>
  );
}
