import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { getStoryCatalog } from "@/lib/story/repository";
import { getExpeditionHud } from "@/lib/story/expedition";
import { StoryShell } from "@/components/story/story-shell";

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * The learner workspace shell lives in a layout so the sidebar, HUD, and story
 * catalog stay mounted while pages navigate. Previously every page rendered its
 * own `StoryShell`, which repeated the session, XP, streak, and catalog reads
 * on every click (several sequential round trips to the database).
 */
export default async function ExpeditionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  if (!context.user.onboardingCompletedAt) redirect(`/${lang}/onboarding`);
  if (context.user.role !== "learner") redirect(`/${lang}/profile`);

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const language = resolveContentLanguage(context.user.targetLanguage, uiLocale);
  const [hud, catalog] = await Promise.all([
    getExpeditionHud(context.user),
    getStoryCatalog(context.user.id, language),
  ]);

  return (
    <StoryShell
      lang={lang}
      hud={hud}
      continueSceneId={catalog?.continue?.sceneId ?? null}
      emailVerified={Boolean(context.user.emailVerifiedAt)}
    >
      {children}
    </StoryShell>
  );
}
