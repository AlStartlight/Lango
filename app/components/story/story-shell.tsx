import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionContext } from "@/lib/auth/session";
import { isUiLocale, resolveContentLanguage } from "@/lib/i18n/locales";
import { getStoryCatalog } from "@/lib/story/repository";
import { getExpeditionHud } from "@/lib/story/expedition";
import {
  ExpeditionShell,
  type ExpeditionSection,
} from "@/components/expedition/expedition-shell";

const SECTION_MAP: Record<string, ExpeditionSection> = {
  stories: "library",
  library: "library",
  passport: "passport",
  learn: "map",
  map: "map",
  reader: "reader",
  practice: "practice",
  vault: "vault",
  results: "results",
  leaderboard: "leaderboard",
  store: "store",
  survival: "survival",
  ambience: "ambience",
};

export async function StoryShell({
  lang,
  active,
  children,
}: {
  lang: string;
  active: string;
  children: ReactNode;
  userName?: string;
}) {
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);

  const uiLocale = isUiLocale(lang) ? lang : "en";
  const language = resolveContentLanguage(context.user.targetLanguage, uiLocale);
  const [hud, catalog] = await Promise.all([
    getExpeditionHud(context.user),
    getStoryCatalog(context.user.id, language),
  ]);

  return (
    <ExpeditionShell
      lang={lang}
      active={SECTION_MAP[active] ?? "library"}
      hud={hud}
      continueSceneId={catalog?.continue?.sceneId ?? null}
      emailVerified={Boolean(context.user.emailVerifiedAt)}
    >
      {children}
    </ExpeditionShell>
  );
}
