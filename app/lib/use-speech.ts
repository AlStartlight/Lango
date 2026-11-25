"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { toSpeechLocale } from "@/lib/i18n/locales";
import {
  ensureVoicesLoaded,
  getEmptyVoicesSnapshot,
  getVoicesSnapshot,
  refreshVoices,
  subscribeVoices,
} from "./speech/voice-store";
import {
  getSpeechGender,
  setSpeechGender,
  subscribeSpeechGender,
} from "./speech/preference";
import {
  pickVoice,
  type SpeechGender,
} from "./speech/voice-catalog";

export type SpeechFailureReason =
  | "unsupported"
  | "no-voice"
  | "empty"
  | "synthesis";

export type SpeakResult =
  | {
      ok: true;
      locale: string;
      voice: SpeechSynthesisVoice | null;
      genderMatched: boolean;
    }
  | {
      ok: false;
      locale: string;
      reason: SpeechFailureReason;
    };

export interface SpeakOptions {
  /** Preferred voice actor gender for the target language. */
  gender?: SpeechGender;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: SpeechFailureReason) => void;
}

export interface SpeechController {
  speak: (text: string, locale?: string, options?: SpeakOptions) => SpeakResult;
  cancel: () => void;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

const DEFAULT_LOCALE = toSpeechLocale("en");

function clamp(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/** Shared installed-voice list; re-renders when the browser finishes loading it. */
export function useSpeechVoices(): SpeechSynthesisVoice[] {
  const voices = useSyncExternalStore(
    subscribeVoices,
    getVoicesSnapshot,
    getEmptyVoicesSnapshot,
  );

  useEffect(() => {
    ensureVoicesLoaded();
  }, []);

  return voices;
}

/**
 * The learner's chosen voice actor gender for a content language, persisted on
 * this device and shared across every audio button.
 */
export function useSpeechGender(
  language: string,
): [SpeechGender, (gender: SpeechGender) => void] {
  const gender = useSyncExternalStore(
    subscribeSpeechGender,
    () => getSpeechGender(language),
    () => "female" as SpeechGender,
  );

  const update = useCallback(
    (next: SpeechGender) => setSpeechGender(language, next),
    [language],
  );

  return [gender, update];
}

export function useSpeech(): SpeechController {
  const voices = useSpeechVoices();
  const spokeRef = useRef(false);
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined";

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    return () => {
      if (spokeRef.current) synth.cancel();
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    (text: string, locale?: string, options?: SpeakOptions): SpeakResult => {
      const resolvedLocale = locale?.trim() || DEFAULT_LOCALE;

      if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance === "undefined"
      ) {
        return { ok: false, locale: resolvedLocale, reason: "unsupported" };
      }

      const content = text.trim();
      if (!content) {
        return { ok: false, locale: resolvedLocale, reason: "empty" };
      }

      // Re-read synchronously in case the list loaded after the last render.
      const available = refreshVoices();
      const match = pickVoice(available, resolvedLocale, options?.gender);

      // The list is loaded but has no voice for this language. Do not fall back
      // to an English/default voice: it would mispronounce the target language.
      if (!match.voice && available.length > 0) {
        options?.onError?.("no-voice");
        return { ok: false, locale: resolvedLocale, reason: "no-voice" };
      }

      const synth = window.speechSynthesis;
      synth.cancel();
      try {
        synth.resume();
      } catch {
        // Some engines throw when there is nothing paused; harmless.
      }

      const utterance = new window.SpeechSynthesisUtterance(content);
      utterance.lang = resolvedLocale;
      if (match.voice) utterance.voice = match.voice;
      utterance.rate = clamp(options?.rate, 0.5, 1.5, 0.9);
      utterance.pitch = clamp(options?.pitch, 0, 2, 1);
      utterance.volume = clamp(options?.volume, 0, 1, 1);

      utterance.onstart = () => {
        spokeRef.current = true;
        options?.onStart?.();
      };
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = () => {
        options?.onError?.("synthesis");
      };

      synth.speak(utterance);
      return {
        ok: true,
        locale: resolvedLocale,
        voice: match.voice,
        genderMatched: match.genderMatched,
      };
    },
    [],
  );

  return { speak, cancel, supported, voices };
}
