import type { SpeechGender } from "./voice-catalog";

const STORAGE_PREFIX = "lango:speech:gender:";
const CHANGE_EVENT = "lango:speech-gender-change";
const DEFAULT_GENDER: SpeechGender = "female";

/** Works even when localStorage is unavailable (private mode / quota). */
const memory = new Map<string, SpeechGender>();

export function speechGenderStorageKey(language: string): string {
  return `${STORAGE_PREFIX}${language}`;
}

function normalizeLanguage(language: string): string {
  return language.trim().toLowerCase();
}

function isSpeechGender(value: unknown): value is SpeechGender {
  return value === "female" || value === "male";
}

/** Read the learner's preferred voice actor for a content language. */
export function getSpeechGender(language: string): SpeechGender {
  const normalized = normalizeLanguage(language);
  const cached = memory.get(normalized);
  if (cached) return cached;
  if (typeof window === "undefined") return DEFAULT_GENDER;
  try {
    const value = window.localStorage.getItem(
      speechGenderStorageKey(normalized),
    );
    if (isSpeechGender(value)) {
      memory.set(normalized, value);
      return value;
    }
    return DEFAULT_GENDER;
  } catch {
    return DEFAULT_GENDER;
  }
}

/**
 * Persist the preference and notify every mounted speaker. `storage` events
 * only fire in other tabs, so a custom event keeps the current tab in sync.
 */
export function setSpeechGender(language: string, gender: SpeechGender): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeLanguage(language);
  memory.set(normalized, gender);
  const key = speechGenderStorageKey(normalized);
  try {
    window.localStorage.setItem(key, gender);
  } catch {
    // Private mode / quota: the in-memory value still applies this session.
  }
  window.dispatchEvent(
    new CustomEvent(CHANGE_EVENT, {
      detail: { language: normalized, gender },
    }),
  );
}

export function subscribeSpeechGender(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key?.startsWith(STORAGE_PREFIX)) listener();
  };
  const handleChange = () => listener();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, handleChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, handleChange);
  };
}

export { DEFAULT_GENDER };
