"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bird,
  CloudRain,
  Moon,
  Music2,
  Settings2,
  Snowflake,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Volume2,
  VolumeX,
  Wind,
  X,
} from "lucide-react";
import type {
  AmbiencePhase,
  AmbiencePhaseMode,
  AmbienceScene,
  AmbienceSound,
} from "@/lib/ambience/types";
import { ambienceCopy, phaseLabel } from "./ambience-copy";
import { useAmbience } from "./ambience-provider";

const SCENE_OPTIONS: { value: AmbienceScene; icon: typeof Sparkles }[] = [
  { value: "sakura", icon: Sparkles },
  { value: "snow", icon: Snowflake },
  { value: "rain", icon: CloudRain },
  { value: "none", icon: Sun },
];

const PHASE_OPTIONS: { value: AmbiencePhaseMode; icon: typeof Sun }[] = [
  { value: "auto", icon: Sparkles },
  { value: "day", icon: Sun },
  { value: "night", icon: Moon },
  { value: "cycle", icon: Sunset },
];

const SOUND_OPTIONS: { value: AmbienceSound; icon: typeof Sun }[] = [
  { value: "auto", icon: Sparkles },
  { value: "birds", icon: Bird },
  { value: "crickets", icon: Music2 },
  { value: "rain", icon: CloudRain },
  { value: "wind", icon: Wind },
  { value: "off", icon: VolumeX },
];

function PhaseIcon({ phase }: { phase: AmbiencePhase }) {
  if (phase === "night") return <Moon className="h-4 w-4" aria-hidden="true" />;
  if (phase === "dawn") return <Sunrise className="h-4 w-4" aria-hidden="true" />;
  if (phase === "dusk") return <Sunset className="h-4 w-4" aria-hidden="true" />;
  return <Sun className="h-4 w-4" aria-hidden="true" />;
}

export function AmbienceDock({ locale, raised = false }: { locale: string; raised?: boolean }) {
  const copy = ambienceCopy(locale);
  const { settings, update, phase, audioState, setSound, toggleSound, resumeAudio } = useAmbience();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const sceneLabel = (value: AmbienceScene) => {
    if (value === "sakura") return copy.sceneSakura;
    if (value === "snow") return copy.sceneSnow;
    if (value === "rain") return copy.sceneRain;
    return copy.sceneNone;
  };
  const phaseOptionLabel = (value: AmbiencePhaseMode) => {
    if (value === "auto") return copy.phaseAuto;
    if (value === "day") return copy.phaseDay;
    if (value === "night") return copy.phaseNight;
    return copy.phaseCycle;
  };
  const soundLabel = (value: AmbienceSound) => {
    if (value === "auto") return copy.soundAuto;
    if (value === "birds") return copy.soundBirds;
    if (value === "crickets") return copy.soundCrickets;
    if (value === "rain") return copy.soundRain;
    if (value === "wind") return copy.soundWind;
    return copy.soundOff;
  };

  const soundOn = settings.sound !== "off";

  return (
    <div
      ref={rootRef}
      className="fixed right-4 z-[70] flex flex-col items-end gap-2"
      style={{
        // The story reader owns a full-width action dock at the bottom edge;
        // keep the ambience control above it instead of covering it.
        bottom: raised
          ? "calc(5.5rem + env(safe-area-inset-bottom))"
          : "calc(1rem + env(safe-area-inset-bottom))",
      }}
    >
      {open && (
        <section
          id="ambience-dock-panel"
          className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-exp-container-high bg-exp-surface-lowest p-4 shadow-[0_18px_40px_-12px_rgba(17,28,45,0.35)]"
          aria-label={copy.dockLabel}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-exp-on-surface">{copy.title}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-exp-on-surface-muted">
                <PhaseIcon phase={phase} />
                {phaseLabel(copy, phase)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={copy.dockClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-exp-container text-exp-on-surface-variant hover:bg-exp-container-high"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-exp-on-surface-muted">
            {copy.sceneTitle}
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {SCENE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = settings.scene === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ scene: option.value })}
                  aria-pressed={active}
                  className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 text-xs font-bold transition-colors ${
                    active
                      ? "border-exp-primary-container bg-exp-primary-container/15 text-exp-primary"
                      : "border-exp-container-high bg-exp-surface-low text-exp-on-surface-variant hover:bg-exp-container"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{sceneLabel(option.value)}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-exp-on-surface-muted">
            {copy.phaseTitle}
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {PHASE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = settings.phaseMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ phaseMode: option.value })}
                  aria-pressed={active}
                  className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 text-xs font-bold transition-colors ${
                    active
                      ? "border-exp-primary-container bg-exp-primary-container/15 text-exp-primary"
                      : "border-exp-container-high bg-exp-surface-low text-exp-on-surface-variant hover:bg-exp-container"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{phaseOptionLabel(option.value)}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-exp-on-surface-muted">
            {copy.soundTitle}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SOUND_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = settings.sound === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSound(option.value)}
                  aria-pressed={active}
                  aria-label={soundLabel(option.value)}
                  title={soundLabel(option.value)}
                  className={`grid h-11 w-11 place-items-center rounded-xl border transition-colors ${
                    active
                      ? "border-exp-primary-container bg-exp-primary-container/15 text-exp-primary"
                      : "border-exp-container-high bg-exp-surface-low text-exp-on-surface-variant hover:bg-exp-container"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {soundOn && (
            <label className="mt-3 block">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-exp-on-surface-muted">
                {copy.volume}
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(event) => update({ volume: Number(event.target.value) })}
                aria-label={copy.volume}
                className="mt-1 h-11 w-full accent-exp-primary"
              />
            </label>
          )}

          {audioState === "blocked" && (
            <button
              type="button"
              onClick={resumeAudio}
              className="mt-1 w-full rounded-xl bg-exp-secondary-fixed px-3 py-2 text-left text-[11px] font-bold text-exp-secondary"
            >
              {copy.soundBlocked}
            </button>
          )}

          <Link
            href={`/${locale}/settings/ambience`}
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-exp-container px-3 text-xs font-extrabold text-exp-primary hover:bg-exp-container-high"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            {copy.dockSettings}
          </Link>
        </section>
      )}

      <div className="flex items-center gap-1 rounded-full border border-exp-container-high bg-exp-surface-lowest/95 p-1 shadow-[0_10px_28px_-10px_rgba(17,28,45,0.4)] backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="ambience-dock-panel"
          aria-label={open ? copy.dockClose : copy.dockOpen}
          title={copy.dockLabel}
          className="flex h-11 items-center gap-2 rounded-full px-3 text-xs font-extrabold text-exp-on-surface hover:bg-exp-container"
        >
          <Sparkles className="h-4 w-4 text-exp-tertiary" aria-hidden="true" />
          <span className="hidden sm:inline">{copy.dockLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (soundOn && audioState === "blocked") {
              resumeAudio();
              return;
            }
            toggleSound();
          }}
          aria-pressed={soundOn}
          aria-label={soundOn ? copy.dockSoundOn : copy.dockSoundOff}
          title={soundOn ? copy.dockSoundOn : copy.dockSoundOff}
          className={`relative grid h-11 w-11 place-items-center rounded-full ${
            soundOn
              ? "bg-exp-primary-container text-exp-on-primary-container"
              : "text-exp-on-surface-variant hover:bg-exp-container"
          }`}
        >
          {soundOn ? (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          )}
          {soundOn && audioState === "blocked" && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-exp-secondary-container" />
          )}
        </button>
      </div>
    </div>
  );
}
