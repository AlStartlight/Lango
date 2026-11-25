"use client";

import { useSyncExternalStore } from "react";
import { Check, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CONTENT_LANGUAGE_LABELS, toSpeechLocale } from "@/lib/i18n/locales";
import {
  useSpeech,
  useSpeechGender,
  useSpeechVoices,
} from "@/lib/use-speech";
import {
  getVoiceAvailability,
  VOICE_SAMPLES,
  type SpeechGender,
} from "@/lib/speech/voice-catalog";

/**
 * SSR renders this component before the client i18n instance initializes, so
 * `t()` would return raw keys on the server and translated text on the client
 * (a hydration mismatch). These English labels keep the first paint and the
 * hydration render identical; translated copy arrives right after mount.
 */
const SSR_LABELS: Record<string, string> = {
  "learning.audio.voice": "Voice",
  "learning.audio.voiceFor": "Voice for {language}",
  "learning.audio.female": "Female",
  "learning.audio.male": "Male",
  "learning.audio.noVoice": "No {language} voice installed",
  "learning.audio.voiceHint": "Pick the reading voice for {language}.",
  "learning.audio.loadingVoices": "Loading voices…",
  "learning.audio.singleVoice": "Only one {language} voice is available.",
  "learning.audio.fallbackVoice": "Using the closest {gender} voice ({voice}) for {language}.",
  "learning.audio.previewHint": "Tap an option to hear a short sample.",
};

function subscribeNoop(): () => void {
  return () => {};
}

function interpolate(template: string, values?: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    values && key in values ? String(values[key]) : match,
  );
}

interface SpeechVoicePickerProps {
  /** Canonical content language (`ja`, `id`, `en`, …), not the route alias. */
  language: string;
  variant?: "compact" | "full";
  className?: string;
}

export function SpeechVoicePicker({
  language,
  variant = "compact",
  className = "",
}: SpeechVoicePickerProps) {
  const { t } = useTranslation();
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const tr = (key: string, values?: Record<string, unknown>) =>
    hydrated ? t(key, values) : interpolate(SSR_LABELS[key] ?? key, values);
  const [gender, setGender] = useSpeechGender(language);
  const voices = useSpeechVoices();
  const { speak } = useSpeech();

  const speechLocale = toSpeechLocale(language);

  const availability = getVoiceAvailability(voices, speechLocale);
  const languageLabel = CONTENT_LANGUAGE_LABELS[language as keyof typeof CONTENT_LANGUAGE_LABELS] ?? language;
  const loaded = voices.length > 0;
  const missing = loaded && availability.total === 0;

  const choose = (next: SpeechGender) => {
    setGender(next);
    speak(VOICE_SAMPLES[language] ?? VOICE_SAMPLES.en ?? "", speechLocale, {
      gender: next,
      rate: 0.85,
    });
  };

  const selectedVoice =
    gender === "female" ? availability.female : availability.male;
  const selectedMatched =
    gender === "female" ? availability.femaleMatched : availability.maleMatched;

  const options: Array<{ value: SpeechGender; label: string; voice: string | null }> = [
    {
      value: "female",
      label: tr("learning.audio.female"),
      voice: availability.female?.name ?? null,
    },
    {
      value: "male",
      label: tr("learning.audio.male"),
      voice: availability.male?.name ?? null,
    },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="text-[11px] font-bold text-muted-text">
          {tr("learning.audio.voice")}
        </span>
        <div
          role="radiogroup"
          aria-label={tr("learning.audio.voiceFor", { language: languageLabel })}
          className="inline-flex rounded-full border border-border-default bg-surface p-0.5"
        >
          {options.map((option) => {
            const selected = gender === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                title={option.voice ?? tr("learning.audio.noVoice", { language: languageLabel })}
                onClick={() => choose(option.value)}
                className={`flex min-h-8 items-center gap-1 rounded-full px-3 text-[11px] font-bold transition-colors ${
                  selected
                    ? "bg-accent-primary text-white"
                    : "text-secondary-text hover:bg-subtle"
                }`}
              >
                {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                {option.label}
              </button>
            );
          })}
        </div>
        {missing && (
          <span className="text-[11px] font-semibold text-state-warning">
            {tr("learning.audio.noVoice", { language: languageLabel })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border-default bg-surface p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="h-4 w-4 text-accent-primary" aria-hidden="true" />
            {tr("learning.audio.voice")}
          </p>
          <p className="mt-1 text-xs text-muted-text">
            {tr("learning.audio.voiceHint", { language: languageLabel })}
          </p>
        </div>
        <span className="rounded-full bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-text">
          {languageLabel}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label={tr("learning.audio.voiceFor", { language: languageLabel })}
        className="mt-3 grid gap-2 sm:grid-cols-2"
      >
        {options.map((option) => {
          const selected = gender === option.value;
          const unavailable = loaded && availability.total === 0;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(option.value)}
              className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                selected
                  ? "border-accent-primary bg-accent-primary/10"
                  : "border-border-default hover:bg-subtle"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-text">
                  {option.voice ??
                    (unavailable
                      ? tr("learning.audio.noVoice", { language: languageLabel })
                      : tr("learning.audio.loadingVoices"))}
                </span>
              </span>
              {selected && (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-primary text-white">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {availability.singleVoice && !missing && (
        <p className="mt-2 text-[11px] text-muted-text">
          {tr("learning.audio.singleVoice", { language: languageLabel })}
        </p>
      )}
      {loaded && availability.total > 0 && !selectedMatched && selectedVoice && (
        <p className="mt-2 text-[11px] font-medium text-state-warning">
          {tr("learning.audio.fallbackVoice", {
            gender:
              gender === "female"
                ? tr("learning.audio.female")
                : tr("learning.audio.male"),
            language: languageLabel,
            voice: selectedVoice.name,
          })}
        </p>
      )}
      {missing && (
        <p className="mt-2 text-xs font-semibold text-state-warning">
          {tr("learning.audio.noVoice", { language: languageLabel })}
        </p>
      )}
      <p className="mt-2 text-[11px] text-muted-text">
        {tr("learning.audio.previewHint")}
      </p>
    </div>
  );
}
