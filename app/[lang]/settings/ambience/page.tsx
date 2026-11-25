import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale } from "@/lib/i18n/locales";
import { StoryShell } from "@/components/story/story-shell";
import { AmbienceSettings } from "@/components/expedition/ambience/ambience-settings";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AmbienceSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const locale = isUiLocale(lang) ? lang : "en";

  return (
    <StoryShell lang={lang} active="ambience">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <AmbienceSettings locale={locale} />
      </div>
    </StoryShell>
  );
}
