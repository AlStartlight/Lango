import {
  DEFAULT_AMBIENCE,
  parseAmbienceSettings,
  type AmbienceSettings,
} from "./types";

/**
 * Device-local ambience store read through `useSyncExternalStore` so the
 * server render (defaults) and the client render (saved prefs) hydrate
 * without mismatches. The snapshot reference is stable between writes.
 */

export const AMBIENCE_STORAGE_KEY = "lango:ambience:v1";

let snapshot: AmbienceSettings = DEFAULT_AMBIENCE;
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): AmbienceSettings {
  if (typeof window === "undefined") return DEFAULT_AMBIENCE;
  try {
    const raw = window.localStorage.getItem(AMBIENCE_STORAGE_KEY);
    if (!raw) return DEFAULT_AMBIENCE;
    return parseAmbienceSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_AMBIENCE;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeAmbience(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAmbienceSnapshot(): AmbienceSettings {
  if (!hydrated) {
    hydrated = true;
    snapshot = readFromStorage();
  }
  return snapshot;
}

export function getAmbienceServerSnapshot(): AmbienceSettings {
  return DEFAULT_AMBIENCE;
}

export function updateAmbience(patch: Partial<AmbienceSettings>): AmbienceSettings {
  // Read first so a write never races the initial hydration.
  getAmbienceSnapshot();
  snapshot = parseAmbienceSettings({ ...snapshot, ...patch });
  try {
    window.localStorage.setItem(AMBIENCE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage unavailable (private mode/quota): keep the in-memory value.
  }
  emit();
  return snapshot;
}

export function resetAmbience(): AmbienceSettings {
  return updateAmbience(DEFAULT_AMBIENCE);
}
