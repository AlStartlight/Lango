"use client";

import { Flame, Gem, Heart, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GamificationBarProps {
  xp: number;
  level: number;
  lives: number;
  streak: number;
}

/**
 * Session HUD for the drill modules. The expedition shell already owns the
 * account-wide streak/XP; this strip only reflects the runs inside one drill,
 * so both can coexist without contradicting each other.
 */
export function GamificationBar({
  xp,
  level,
  lives,
  streak,
}: GamificationBarProps) {
  const { t } = useTranslation();
  const nextLevelXp = Math.max(1, level * 100);
  const progressPct = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <div className="shrink-0 border-b border-exp-container-high bg-exp-surface-lowest">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
        <span className="exp-pill bg-exp-container text-exp-on-surface">
          <Sparkles className="h-3.5 w-3.5 text-exp-tertiary" aria-hidden="true" />
          {t("learning.survival.sessionBadge")}
        </span>

        <span className="exp-pill bg-exp-container text-exp-on-surface">
          <Gem className="h-3.5 w-3.5 text-exp-primary" aria-hidden="true" />
          <span className="tabular-nums">{xp}</span>
          {t("learning.common.xp")}
        </span>

        <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
          {t("learning.common.level", { level })}
        </span>

        <div
          className="hidden min-w-32 flex-1 items-center gap-2 sm:flex"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label={`${t("learning.common.xp")} ${progressPct}%`}
        >
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-exp-container-highest shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-exp-primary-container to-exp-primary-fixed-dim transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[11px] font-extrabold tabular-nums text-exp-primary">
            {progressPct}%
          </span>
        </div>

        {streak > 0 && (
          <span className="exp-pill bg-exp-secondary-fixed text-exp-secondary">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">{streak}</span>
            {t("learning.number.streak")}
          </span>
        )}

        <div
          className="ml-auto flex items-center gap-1"
          role="img"
          aria-label={`${t("learning.number.lives")}: ${lives}`}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={`inline-grid h-7 w-7 place-items-center rounded-full transition-colors duration-300 ${
                index < lives
                  ? "bg-exp-error/10 text-exp-error"
                  : "bg-exp-container text-exp-outline"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${index < lives ? "fill-current" : ""}`}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
