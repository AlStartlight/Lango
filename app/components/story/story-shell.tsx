import type { ReactNode } from "react";
import type { ExpeditionHud } from "@/lib/story/expedition";
import { ExpeditionShell } from "@/components/expedition/expedition-shell";

/**
 * Presentational shell. Authentication and HUD/catalog data are resolved once
 * in `app/[lang]/(expedition)/layout.tsx`, so navigating between learner pages
 * does not refetch them.
 */
export function StoryShell({
  lang,
  hud,
  continueSceneId,
  emailVerified,
  children,
}: {
  lang: string;
  hud: ExpeditionHud;
  continueSceneId: string | null;
  emailVerified: boolean;
  children: ReactNode;
}) {
  return (
    <ExpeditionShell
      lang={lang}
      hud={hud}
      continueSceneId={continueSceneId}
      emailVerified={emailVerified}
    >
      {children}
    </ExpeditionShell>
  );
}
