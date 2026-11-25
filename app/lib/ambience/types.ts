/**
 * Learning ambience ("Suasana Belajar")
 *
 * A device-local atmosphere for the learner workspace: falling sakura,
 * snow, drizzle, an optional day/night cycle and a synthesized soundscape
 * (birds by day, crickets by night, rain and wind).
 *
 * No schema change: preferences stay on the device, mirroring the reading
 * preferences. Everything here is pure so it can be unit-tested and shared
 * by the provider, the settings page and the shell dock.
 */

export const AMBIENCE_SCENES = ["sakura", "snow", "rain", "none"] as const;
export type AmbienceScene = (typeof AMBIENCE_SCENES)[number];

export const AMBIENCE_PHASE_MODES = ["auto", "day", "night", "cycle"] as const;
export type AmbiencePhaseMode = (typeof AMBIENCE_PHASE_MODES)[number];

export const AMBIENCE_SOUNDS = [
  "auto",
  "off",
  "birds",
  "crickets",
  "rain",
  "wind",
] as const;
export type AmbienceSound = (typeof AMBIENCE_SOUNDS)[number];

export const AMBIENCE_MOTION = ["auto", "full", "calm", "off"] as const;
export type AmbienceMotion = (typeof AMBIENCE_MOTION)[number];

export type AmbiencePhase = "dawn" | "day" | "dusk" | "night";

export interface AmbienceSettings {
  enabled: boolean;
  scene: AmbienceScene;
  phaseMode: AmbiencePhaseMode;
  sound: AmbienceSound;
  /** 0–1 master volume for the synthesized soundscape. */
  volume: number;
  motion: AmbienceMotion;
}

export interface AmbiencePreset {
  id: string;
  scene: AmbienceScene;
  phaseMode: AmbiencePhaseMode;
  sound: AmbienceSound;
}

export const DEFAULT_AMBIENCE: AmbienceSettings = {
  enabled: true,
  scene: "sakura",
  phaseMode: "auto",
  sound: "off",
  volume: 0.5,
  motion: "auto",
};

/** Presets are complete "study moods", not single settings. */
export const AMBIENCE_PRESETS: readonly AmbiencePreset[] = [
  { id: "sakura-morning", scene: "sakura", phaseMode: "day", sound: "birds" },
  { id: "snow-calm", scene: "snow", phaseMode: "day", sound: "wind" },
  { id: "drizzle-focus", scene: "rain", phaseMode: "day", sound: "rain" },
  { id: "night-crickets", scene: "sakura", phaseMode: "night", sound: "crickets" },
  { id: "day-night-rotation", scene: "sakura", phaseMode: "cycle", sound: "auto" },
  { id: "minimal", scene: "none", phaseMode: "auto", sound: "off" },
];

/** One full day→dusk→night→dawn loop takes 4 × 2 minutes. */
export const CYCLE_BUCKET_MS = 2 * 60 * 1000;

export function resolvePhase(mode: AmbiencePhaseMode, now: number): AmbiencePhase {
  if (mode === "day") return "day";
  if (mode === "night") return "night";
  if (mode === "cycle") {
    const order: AmbiencePhase[] = ["day", "dusk", "night", "dawn"];
    return order[Math.floor(now / CYCLE_BUCKET_MS) % order.length];
  }

  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 5 * 60 && minutes < 8 * 60) return "dawn";
  if (minutes >= 8 * 60 && minutes < 17 * 60) return "day";
  if (minutes >= 17 * 60 && minutes < 19.5 * 60) return "dusk";
  return "night";
}

export type ResolvedSound = "birds" | "crickets" | "rain" | "wind" | null;

export function resolveSound(
  sound: AmbienceSound,
  scene: AmbienceScene,
  phase: AmbiencePhase,
): ResolvedSound {
  if (sound === "off") return null;
  if (sound !== "auto") return sound;

  // Weather is the strongest signal; otherwise the sky decides who sings.
  if (scene === "rain") return "rain";
  if (scene === "snow") return "wind";
  if (phase === "night") return "crickets";
  return "birds";
}

export type ResolvedMotion = "full" | "calm" | "off";

export function resolveMotion(
  motion: AmbienceMotion,
  prefersReducedMotion: boolean,
): ResolvedMotion {
  if (motion !== "auto") return motion;
  return prefersReducedMotion ? "calm" : "full";
}

export function isAmbienceScene(value: unknown): value is AmbienceScene {
  return typeof value === "string" && (AMBIENCE_SCENES as readonly string[]).includes(value);
}

export function isAmbiencePhaseMode(value: unknown): value is AmbiencePhaseMode {
  return (
    typeof value === "string" && (AMBIENCE_PHASE_MODES as readonly string[]).includes(value)
  );
}

export function isAmbienceSound(value: unknown): value is AmbienceSound {
  return (
    typeof value === "string" && (AMBIENCE_SOUNDS as readonly string[]).includes(value)
  );
}

export function isAmbienceMotion(value: unknown): value is AmbienceMotion {
  return (
    typeof value === "string" && (AMBIENCE_MOTION as readonly string[]).includes(value)
  );
}

export function parseAmbienceSettings(value: unknown): AmbienceSettings {
  if (!value || typeof value !== "object") return DEFAULT_AMBIENCE;
  const raw = value as Record<string, unknown>;
  const volume =
    typeof raw.volume === "number" && Number.isFinite(raw.volume)
      ? Math.min(1, Math.max(0, raw.volume))
      : DEFAULT_AMBIENCE.volume;

  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_AMBIENCE.enabled,
    scene: isAmbienceScene(raw.scene) ? raw.scene : DEFAULT_AMBIENCE.scene,
    phaseMode: isAmbiencePhaseMode(raw.phaseMode)
      ? raw.phaseMode
      : DEFAULT_AMBIENCE.phaseMode,
    sound: isAmbienceSound(raw.sound) ? raw.sound : DEFAULT_AMBIENCE.sound,
    volume,
    motion: isAmbienceMotion(raw.motion) ? raw.motion : DEFAULT_AMBIENCE.motion,
  };
}
