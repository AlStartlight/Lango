"use client";

import { AmbientParticles } from "./ambient-particles";
import { useAmbience } from "./ambience-provider";

/**
 * A light, readable atmosphere *above* the page content: a per-phase tint on
 * the cards plus weather particles restricted to the screen edges, so the
 * scenery is visible without crossing the text the learner is reading.
 * Sits at z-30 — above `<main>` but below the header (z-40) and dock (z-70).
 */
export function AmbienceOverlay() {
  const { settings, phase, motion, hydrated } = useAmbience();
  if (!hydrated || !settings.enabled || motion === "off") return null;

  return (
    <div className="amb-overlay" data-amb-phase={phase} aria-hidden="true">
      <div className="amb-tint" />
      {settings.scene !== "none" && (
        <AmbientParticles scene={settings.scene} motion={motion} variant="edge" />
      )}
    </div>
  );
}
