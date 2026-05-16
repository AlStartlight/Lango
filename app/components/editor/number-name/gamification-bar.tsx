"use client";

interface GamificationBarProps {
  xp: number;
  level: number;
  lives: number;
  streak: number;
}

export function GamificationBar({
  xp,
  level,
  lives,
  streak,
}: GamificationBarProps) {
  const nextLevelXp = level * 100;
  const progressPct = Math.min(100, (xp / nextLevelXp) * 100);
  const progressColor =
    progressPct >= 80
      ? "bg-[#d2ff5e]"
      : progressPct >= 40
        ? "bg-yellow-400"
        : "bg-orange-400";

  return (
    <div className="shrink-0 bg-gradient-to-r from-[#1e1e1e] via-[#222] to-[#1e1e1e] border-b border-[#2a2a2a]">
      <div className="flex items-center gap-5 px-6 py-2.5 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-yellow-400/10">
            <span className="text-yellow-400 text-xs font-bold">✦</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold tabular-nums">{xp}</span>
              <span className="text-white/40 text-xs">XP</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${progressPct >= 80 ? "bg-[#d2ff5e]/20 text-[#d2ff5e]" : "bg-yellow-400/20 text-yellow-400"}`}>
                Lv.{level}
              </span>
            </div>
            <div className="w-24 h-1 rounded-full bg-[#333] overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-400/10 border border-orange-400/20">
            <span className="text-sm">🔥</span>
            <span className="text-orange-300 text-xs font-semibold tabular-nums">{streak}</span>
            <span className="text-orange-400/50 text-[10px] hidden sm:inline">day streak</span>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs transition-all duration-300 ${
                i < lives
                  ? "text-red-400 bg-red-400/10"
                  : "text-[#333] bg-[#252525]"
              }`}
            >
              ♥
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
