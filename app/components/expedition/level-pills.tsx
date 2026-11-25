import Link from "next/link";

export interface LevelPill {
  tier: string;
  label: string;
  levelCode: string;
  framework?: string;
}

/**
 * Level rail used to jump between the five story tiers of the active language
 * (JLPT N5–N1 or CEFR A1–C1). Rendered as links so it stays a Server
 * Component and keeps each level's progress server-derived.
 */
export function LevelPills({
  levels,
  activeTier,
  hrefFor,
  label,
  className = "",
}: {
  levels: LevelPill[];
  activeTier: string | null;
  hrefFor: (tier: string) => string;
  label?: string;
  className?: string;
}) {
  if (levels.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {label ? (
        <span className="mr-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-exp-outline">
          {label}
        </span>
      ) : null}
      {levels.map((level) => {
        const active = level.tier === activeTier;
        return (
          <Link
            key={level.tier}
            href={hrefFor(level.tier)}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
              active
                ? "bg-exp-primary text-exp-on-primary shadow-[0_2px_0_var(--exp-primary)]"
                : "bg-exp-surface-lowest text-exp-on-surface-variant hover:bg-exp-container"
            }`}
          >
            {level.levelCode}
            <span className="ml-1 hidden text-[9px] font-bold opacity-70 sm:inline">
              {level.framework ?? ""}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
