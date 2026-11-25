"use client";

import type { AmbiencePhase, AmbienceScene } from "@/lib/ambience/types";

/**
 * Fixed, pointer-transparent scenery behind the learner workspace:
 * sky gradient, sun/moon, stars, hills, a readability scrim and weather.
 * It sits at z-index 0 while the shell content is lifted above it.
 */
export function AmbienceLayer({
  phase,
  scene,
}: {
  phase: AmbiencePhase;
  scene: AmbienceScene;
}) {
  return (
    <div className="amb-layer" data-amb-phase={phase} aria-hidden="true">
      <div className="amb-sky" />
      <div className="amb-stars" />
      <div className="amb-celestial" />
      <div className="amb-hills" />
      <div className="amb-hills amb-hills-near" />
      <div className="amb-scrim" />
      {scene === "rain" && <div className="amb-rain-veil" />}
      <div className="amb-vignette" />
    </div>
  );
}
