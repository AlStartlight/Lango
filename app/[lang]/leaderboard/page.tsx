import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Crown, Flame, Medal, Trophy } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isUiLocale } from "@/lib/i18n/locales";
import { getLearnerLeague } from "@/lib/story/expedition";
import { StoryShell } from "@/components/story/story-shell";
import { expeditionCopy } from "@/components/expedition/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const context = await getSessionContext();
  if (!context) redirect(`/${lang}/sign-in`);
  const uiLocale = isUiLocale(lang) ? lang : "en";
  const copy = expeditionCopy(uiLocale);

  const [league, rank, total] = await Promise.all([
    getLearnerLeague(context.user.id),
    prisma
      ? prisma.user
          .count({ where: { role: "learner", xpPoints: { gt: context.user.xpPoints } } })
          .then((count) => count + 1)
      : Promise.resolve(1),
    prisma ? prisma.user.count({ where: { role: "learner" } }) : Promise.resolve(1),
  ]);

  const podium = league.slice(0, 3);
  const rest = league.slice(3);

  return (
    <StoryShell lang={lang} active="leaderboard">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:py-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.top10}
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {copy.leaderboardTitle}
            </h1>
            <p className="mt-1 text-sm font-medium text-exp-on-surface-variant">
              {copy.leaderboardSubtitle}
            </p>
          </div>
          <Link href={`/${lang}/learn`} className="exp-btn exp-btn-ghost">
            {copy.backToMap}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {podium.map((row, index) => {
            const styles = [
              "bg-gradient-to-br from-exp-secondary-fixed to-exp-secondary-fixed-dim text-exp-secondary",
              "bg-exp-surface-lowest text-exp-on-surface",
              "bg-exp-surface-lowest text-exp-on-surface",
            ];
            return (
              <div
                key={row.id}
                className={`relative overflow-hidden rounded-2xl p-4 shadow-md ${styles[index]} ${
                  index === 0 ? "sm:-translate-y-2" : ""
                } ${row.isMe ? "ring-2 ring-exp-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">#{index + 1}</span>
                  {index === 0 ? (
                    <Crown className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Medal className="h-5 w-5 opacity-60" aria-hidden="true" />
                  )}
                </div>
                <span className="mt-3 grid h-12 w-12 place-items-center rounded-full bg-exp-primary-container text-sm font-extrabold text-exp-on-primary-container">
                  {row.name.slice(0, 1)}
                </span>
                <p className="mt-2 truncate text-sm font-extrabold">
                  {row.isMe ? copy.you.replace("{name}", row.name) : row.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold opacity-80">
                  <Flame className="h-3 w-3" aria-hidden="true" />
                  {row.streak} {copy.streakDays}
                </p>
                <p className="mt-2 text-lg font-extrabold">
                  {row.xp.toLocaleString("en-US")}{" "}
                  <span className="text-[10px] font-extrabold uppercase">XP</span>
                </p>
              </div>
            );
          })}
        </div>

        <div className="exp-card overflow-hidden">
          <div className="grid grid-cols-[2.5rem_1fr_auto] gap-2 border-b border-exp-container-high px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-wider text-exp-outline">
            <span>#</span>
            <span>{copy.explorer}</span>
            <span>{copy.xp}</span>
          </div>
          <div className="divide-y divide-exp-container-high">
            {rest.map((row, index) => (
              <div
                key={row.id}
                className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-4 py-3 ${
                  row.isMe ? "bg-exp-primary-fixed/20" : ""
                }`}
              >
                <span className="text-sm font-black text-exp-outline">{index + 4}</span>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-exp-container text-xs font-extrabold text-exp-on-surface-variant">
                    {row.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {row.isMe ? copy.you.replace("{name}", row.name) : row.name}
                    </p>
                    <p className="text-[10px] font-semibold text-exp-secondary">
                      {copy.level} {row.level} · {row.streak} {copy.streakDays}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-exp-primary">
                  {row.xp.toLocaleString("en-US")} XP
                </span>
              </div>
            ))}
            {rest.length === 0 && league.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-exp-on-surface-variant">
                {copy.leagueEmpty}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-exp-surface-low px-4 py-3">
            <span className="text-xs font-bold text-exp-on-surface-variant">
              {copy.yourRank}: <strong className="text-exp-primary">#{rank}</strong> {copy.of}{" "}
              {total} {copy.explorer}
            </span>
            <Link href={`/${lang}/practice`} className="flex items-center gap-1 text-xs font-extrabold text-exp-primary hover:underline">
              {copy.practiceTitle}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </StoryShell>
  );
}
