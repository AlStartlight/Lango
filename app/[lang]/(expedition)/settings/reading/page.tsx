import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { ReadingSettings } from "@/components/story/reading-settings";
import { storyCopy } from "@/components/story/story-copy";

export const dynamic = "force-dynamic";

export default async function ReadingSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = storyCopy(uiLocale);
  const language = resolveContentLanguage(context.user.targetLanguage, uiLocale);
  return (
    <>
      <h1 className="text-2xl font-semibold">{copy.storyProgress}</h1>
      <p className="mt-1 text-sm text-muted-text">{copy.language}: {language}</p>
      <div className="mt-6 max-w-xl">
        <ReadingSettings language={language} locale={uiLocale} />
      </div>
    </>
  );
}
