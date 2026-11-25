"use client";

import {
  Bird,
  CloudRain,
  Moon,
  Music2,
  RotateCcw,
  Snowflake,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";
import {
  AMBIENCE_PRESETS,
  type AmbienceMotion,
  type AmbiencePhase,
  type AmbiencePhaseMode,
  type AmbiencePreset,
  type AmbienceScene,
  type AmbienceSound,
} from "@/lib/ambience/types";
import { resetAmbience } from "@/lib/ambience/prefs";
import { ambienceCopy, ambiencePresetCopy, phaseLabel } from "./ambience-copy";
import { useAmbience } from "./ambience-provider";

const SCENE_OPTIONS: {
  value: AmbienceScene;
  icon: typeof Sparkles;
  labelKey: "sceneSakura" | "sceneSnow" | "sceneRain" | "sceneNone";
}[] = [
  { value: "sakura", icon: Sparkles, labelKey: "sceneSakura" },
  { value: "snow", icon: Snowflake, labelKey: "sceneSnow" },
  { value: "rain", icon: CloudRain, labelKey: "sceneRain" },
  { value: "none", icon: Sun, labelKey: "sceneNone" },
];

const PHASE_OPTIONS: {
  value: AmbiencePhaseMode;
  icon: typeof Sun;
  labelKey: "phaseAuto" | "phaseDay" | "phaseNight" | "phaseCycle";
}[] = [
  { value: "auto", icon: Sparkles, labelKey: "phaseAuto" },
  { value: "day", icon: Sun, labelKey: "phaseDay" },
  { value: "night", icon: Moon, labelKey: "phaseNight" },
  { value: "cycle", icon: Sunset, labelKey: "phaseCycle" },
];

const SOUND_OPTIONS: {
  value: AmbienceSound;
  icon: typeof Sun;
  labelKey: "soundAuto" | "soundOff" | "soundBirds" | "soundCrickets" | "soundRain" | "soundWind";
}[] = [
  { value: "auto", icon: Sparkles, labelKey: "soundAuto" },
  { value: "birds", icon: Bird, labelKey: "soundBirds" },
  { value: "crickets", icon: Music2, labelKey: "soundCrickets" },
  { value: "rain", icon: CloudRain, labelKey: "soundRain" },
  { value: "wind", icon: Wind, labelKey: "soundWind" },
  { value: "off", icon: VolumeX, labelKey: "soundOff" },
];

const MOTION_OPTIONS: {
  value: AmbienceMotion;
  labelKey: "motionAuto" | "motionFull" | "motionCalm" | "motionOff";
}[] = [
  { value: "auto", labelKey: "motionAuto" },
  { value: "full", labelKey: "motionFull" },
  { value: "calm", labelKey: "motionCalm" },
  { value: "off", labelKey: "motionOff" },
];

function presetPhase(preset: AmbiencePreset): AmbiencePhase {
  if (preset.phaseMode === "night") return "night";
  if (preset.phaseMode === "day") return "day";
  if (preset.phaseMode === "cycle") return "dusk";
  return "day";
}

function presetIcon(id: string) {
  if (id === "snow-calm") return Snowflake;
  if (id === "drizzle-focus") return CloudRain;
  if (id === "night-crickets") return Moon;
  if (id === "day-night-rotation") return Sunrise;
  if (id === "minimal") return Sun;
  return Sparkles;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-exp-primary-container" : "bg-exp-container-highest"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function chipClass(active: boolean) {
  return `flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors ${
    active
      ? "border-exp-primary-container bg-exp-primary-container/15 text-exp-primary"
      : "border-exp-container-high bg-exp-surface-low text-exp-on-surface-variant hover:bg-exp-container"
  }`;
}

export function AmbienceSettings({ locale }: { locale: string }) {
  const copy = ambienceCopy(locale);
  const {
    settings,
    update,
    applyPreset,
    phase,
    audioState,
    setSound,
    resumeAudio,
    hydrated,
  } = useAmbience();

  return (
    <div className="flex flex-col gap-4">
      <section className="exp-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-exp-secondary">
              {copy.livePreview}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-exp-on-surface">{copy.title}</h2>
            <p className="mt-1.5 text-sm font-medium leading-6 text-exp-on-surface-variant">
              {copy.subtitle}
            </p>
          </div>
          <span className="exp-pill bg-exp-container text-exp-on-surface">
            {phase === "night" && <Moon className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />}
            {phase === "dawn" && <Sunrise className="h-4 w-4 text-exp-secondary-container" aria-hidden="true" />}
            {phase === "day" && <Sun className="h-4 w-4 text-exp-secondary-container" aria-hidden="true" />}
            {phase === "dusk" && <Sunset className="h-4 w-4 text-exp-secondary" aria-hidden="true" />}
            {hydrated ? phaseLabel(copy, phase) : copy.phaseLabelDay}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-exp-surface-low p-4">
          <div>
            <p className="text-sm font-extrabold text-exp-on-surface">{copy.masterTitle}</p>
            <p className="mt-0.5 text-xs font-medium text-exp-on-surface-muted">{copy.masterBody}</p>
          </div>
          <Toggle
            checked={settings.enabled}
            onChange={(enabled) => update({ enabled })}
            label={copy.masterTitle}
          />
        </div>
      </section>

      <section className="exp-card p-5 sm:p-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-exp-on-surface-muted">
          {copy.presetsTitle}
        </h3>
        <p className="mt-1 text-xs font-medium text-exp-on-surface-muted">{copy.presetsHint}</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {AMBIENCE_PRESETS.map((preset) => {
            const Icon = presetIcon(preset.id);
            const text = ambiencePresetCopy(copy, preset.id);
            const active =
              settings.enabled &&
              settings.scene === preset.scene &&
              settings.phaseMode === preset.phaseMode &&
              settings.sound === preset.sound;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-pressed={active}
                className={`group flex min-h-[5.5rem] flex-col gap-2 rounded-2xl border-2 p-3 text-left transition-transform hover:-translate-y-0.5 ${
                  active
                    ? "border-exp-primary-container bg-exp-primary-container/10"
                    : "border-exp-container-high bg-exp-surface-lowest hover:border-exp-outline-variant"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="amb-swatch" data-amb-phase={presetPhase(preset)}>
                    <Icon className="h-3.5 w-3.5 text-exp-on-surface" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-extrabold text-exp-on-surface">{text.title}</span>
                </span>
                <span className="text-[11px] font-medium leading-4 text-exp-on-surface-muted">
                  {text.body}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="exp-card p-5 sm:p-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-exp-on-surface-muted">
          {copy.sceneTitle}
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SCENE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ scene: option.value })}
                aria-pressed={settings.scene === option.value}
                className={chipClass(settings.scene === option.value)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{copy[option.labelKey]}</span>
              </button>
            );
          })}
        </div>

        <h3 className="mt-5 text-sm font-extrabold uppercase tracking-wide text-exp-on-surface-muted">
          {copy.phaseTitle}
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PHASE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ phaseMode: option.value })}
                aria-pressed={settings.phaseMode === option.value}
                className={chipClass(settings.phaseMode === option.value)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{copy[option.labelKey]}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs font-medium leading-5 text-exp-on-surface-muted">
          {settings.phaseMode === "cycle" ? copy.phaseHintCycle : copy.phaseHintAuto}
        </p>
      </section>

      <section className="exp-card p-5 sm:p-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-exp-on-surface-muted">
          {copy.soundTitle}
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SOUND_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSound(option.value)}
                aria-pressed={settings.sound === option.value}
                className={chipClass(settings.sound === option.value)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{copy[option.labelKey]}</span>
              </button>
            );
          })}
        </div>

        <label className="mt-4 block">
          <span className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wide text-exp-on-surface-muted">
            {copy.volume}
            <span className="text-exp-primary">{Math.round(settings.volume * 100)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(event) => update({ volume: Number(event.target.value) })}
            aria-label={copy.volume}
            className="mt-2 h-11 w-full accent-exp-primary"
          />
        </label>

        <p className="text-xs font-medium leading-5 text-exp-on-surface-muted">{copy.soundHint}</p>
        {audioState === "blocked" && (
          <button
            type="button"
            onClick={resumeAudio}
            className="mt-2 flex min-h-11 items-center gap-2 rounded-xl bg-exp-secondary-fixed px-3 text-xs font-extrabold text-exp-secondary"
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            {copy.soundBlocked}
          </button>
        )}
        {audioState === "on" && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-exp-success">
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.soundPlaying}
          </p>
        )}
      </section>

      <section className="exp-card p-5 sm:p-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-exp-on-surface-muted">
          {copy.motionTitle}
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MOTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => update({ motion: option.value })}
              aria-pressed={settings.motion === option.value}
              className={chipClass(settings.motion === option.value)}
            >
              <span>{copy[option.labelKey]}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-medium leading-5 text-exp-on-surface-muted">
          {copy.motionHint}
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-exp-on-surface-muted">{copy.storedNote}</p>
        <button
          type="button"
          onClick={() => resetAmbience()}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-exp-container-high bg-exp-surface-lowest px-3 text-xs font-extrabold text-exp-on-surface-variant hover:bg-exp-container"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {copy.reset}
        </button>
      </div>
    </div>
  );
}
