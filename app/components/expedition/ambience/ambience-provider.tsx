"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  resolveMotion,
  resolvePhase,
  resolveSound,
  type AmbiencePhase,
  type AmbiencePreset,
  type AmbienceSettings,
  type AmbienceSound,
  type ResolvedMotion,
  type ResolvedSound,
} from "@/lib/ambience/types";
import {
  getAmbienceServerSnapshot,
  getAmbienceSnapshot,
  subscribeAmbience,
  updateAmbience,
} from "@/lib/ambience/prefs";
import { AmbientAudioEngine, type AmbientAudioState } from "./ambient-audio";
import { AmbienceLayer } from "./ambience-layer";

interface AmbienceContextValue {
  settings: AmbienceSettings;
  update: (patch: Partial<AmbienceSettings>) => void;
  applyPreset: (preset: AmbiencePreset) => void;
  phase: AmbiencePhase;
  sound: ResolvedSound;
  motion: ResolvedMotion;
  audioState: AmbientAudioState;
  setSound: (sound: AmbienceSound) => void;
  toggleSound: () => void;
  resumeAudio: () => void;
  hydrated: boolean;
}

const AmbienceContext = createContext<AmbienceContextValue | null>(null);

const noopSubscribe = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function AmbienceProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(
    subscribeAmbience,
    getAmbienceSnapshot,
    getAmbienceServerSnapshot,
  );
  const hydrated = useHydrated();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  const [audioState, setAudioState] = useState<AmbientAudioState>("idle");
  const engineRef = useRef<AmbientAudioEngine | null>(null);

  // While hydrating, both server and client render "day" so React sees the
  // same tree; the real phase arrives on the next tick.
  const phase = hydrated ? resolvePhase(settings.phaseMode, now) : "day";
  const motion = resolveMotion(settings.motion, prefersReducedMotion);
  const sound = settings.enabled ? resolveSound(settings.sound, settings.scene, phase) : null;

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new AmbientAudioEngine();
      engineRef.current.onStateChange(setAudioState);
    }
    return engineRef.current;
  }, []);

  const startSound = useCallback(
    (next: AmbienceSettings) => {
      const engine = getEngine();
      const nextSound = next.enabled
        ? resolveSound(next.sound, next.scene, resolvePhase(next.phaseMode, Date.now()))
        : null;
      if (!nextSound) {
        engine.stop();
        return;
      }
      void engine.start(nextSound, next.volume);
    },
    [getEngine],
  );

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setInterval(() => setNow(Date.now()), 20_000);
    return () => window.clearInterval(timer);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    startSound(settings);
    // `sound` covers phase/scene/sound changes; the remaining fields are read
    // inside startSound but must not re-trigger audio on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sound, settings.enabled, settings.scene, settings.phaseMode, startSound]);

  useEffect(() => {
    if (!hydrated) return;
    engineRef.current?.setVolume(settings.volume);
  }, [hydrated, settings.volume]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // Browsers block autoplay until a gesture. When that happens, resume on the
  // first interaction anywhere in the learner workspace.
  useEffect(() => {
    if (audioState !== "blocked") return;
    const resume = () => {
      void engineRef.current?.resume();
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [audioState]);

  const update = useCallback((patch: Partial<AmbienceSettings>) => {
    updateAmbience(patch);
  }, []);

  const applyPreset = useCallback(
    (preset: AmbiencePreset) => {
      const next = updateAmbience({
        enabled: true,
        scene: preset.scene,
        phaseMode: preset.phaseMode,
        sound: preset.sound,
      });
      // Run inside the click so the AudioContext unlocks with a gesture.
      startSound(next);
    },
    [startSound],
  );

  const setSound = useCallback(
    (sound: AmbienceSound) => {
      const next = updateAmbience({ sound });
      startSound(next);
    },
    [startSound],
  );

  const toggleSound = useCallback(() => {
    setSound(settings.sound === "off" ? "auto" : "off");
  }, [settings.sound, setSound]);

  const resumeAudio = useCallback(() => {
    void engineRef.current?.resume();
  }, []);

  const value: AmbienceContextValue = {
    settings,
    update,
    applyPreset,
    phase,
    sound,
    motion,
    audioState,
    setSound,
    toggleSound,
    resumeAudio,
    hydrated,
  };

  return (
    <AmbienceContext.Provider value={value}>
      {settings.enabled && hydrated && (
        <AmbienceLayer phase={phase} scene={settings.scene} />
      )}
      {children}
    </AmbienceContext.Provider>
  );
}

export function useAmbience(): AmbienceContextValue {
  const value = useContext(AmbienceContext);
  if (!value) {
    throw new Error("useAmbience must be used inside <AmbienceProvider>");
  }
  return value;
}
