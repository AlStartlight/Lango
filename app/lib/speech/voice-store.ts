/**
 * Shared, SSR-safe store for `speechSynthesis.getVoices()`.
 *
 * Chrome/Edge return an empty array until the voices load, and the
 * `voiceschanged` event is not fired consistently across browsers. A single
 * app-wide store loads the list once, retries briefly, and re-renders every
 * consumer when the list changes.
 */

const EMPTY_VOICES: SpeechSynthesisVoice[] = [];
const listeners = new Set<() => void>();

let voices: SpeechSynthesisVoice[] = EMPTY_VOICES;
let started = false;
const retryTimers: number[] = [];

function notify(): void {
  for (const listener of listeners) listener();
}

function sameVoices(a: readonly SpeechSynthesisVoice[], b: readonly SpeechSynthesisVoice[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((voice, index) => {
    const other = b[index];
    return (
      voice.voiceURI === other?.voiceURI &&
      voice.name === other.name &&
      voice.lang === other.lang
    );
  });
}

export function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return EMPTY_VOICES;
  }
  const next = window.speechSynthesis.getVoices();
  if (!sameVoices(next, voices)) {
    voices = next.length > 0 ? next : EMPTY_VOICES;
    notify();
  }
  return voices;
}

function clearRetries(): void {
  while (retryTimers.length > 0) {
    const timer = retryTimers.pop();
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

export function ensureVoicesLoaded(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) {
    refreshVoices();
  }

  if (started) return;
  started = true;

  synth.addEventListener("voiceschanged", refreshVoices);
  // Some browsers populate the list asynchronously without firing the event.
  for (const delay of [0, 120, 400, 900, 1600, 2600]) {
    retryTimers.push(
      window.setTimeout(() => {
        refreshVoices();
        if (voices.length > 0) clearRetries();
      }, delay),
    );
  }
}

export function subscribeVoices(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVoicesSnapshot(): SpeechSynthesisVoice[] {
  return voices;
}

export function getEmptyVoicesSnapshot(): SpeechSynthesisVoice[] {
  return EMPTY_VOICES;
}
