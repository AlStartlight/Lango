import { notFound, redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { getSceneDetail } from "@/lib/story/repository";
import { getEpisodeJourney } from "@/lib/story/journey";
import { StoryReader } from "@/components/story/story-reader";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ lang: string; sceneId: string }>;
}) {
  const { lang, sceneId } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const explanationLocale = ["id", "en", "ja"].includes(context.user.explanationLocale)
    ? context.user.explanationLocale
    : "en";
  const scene = await getSceneDetail(context.user.id, sceneId, explanationLocale);
  if (!scene) notFound();

  const journey = await getEpisodeJourney(context.user.id, {
    language: scene.languageCode,
    episodeId: scene.episode.id,
  });
  if (!journey) notFound();
  if (journey.current?.status === "locked") {
    redirect(`/${lang}/reader?locked=${scene.episode.id}`);
  }

  return (
    <>
      <StoryReader scene={scene} locale={uiLocale} journey={journey} />
    </>
  );
}
