"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ModuleState, PhaseId, GamificationState } from "./types";

const INITIAL_GAMIFICATION: GamificationState = {
  xp: 0,
  lives: 3,
  streak: 0,
  level: 1,
};

interface ModuleContextValue {
  state: ModuleState;
  setLevel: (id: number) => void;
  goToPhase: (id: PhaseId) => void;
  nextPhase: () => void;
  addXp: (amount: number) => void;
  loseLife: () => void;
  addStreak: () => void;
  resetStreak: () => void;
  resetModule: () => void;
  activeModule: string | null;
  setActiveModule: (id: string | null) => void;
}

const ModuleContext = createContext<ModuleContextValue | null>(null);

const PHASE_ORDER: PhaseId[] = [
  "flashcard",
  "listen-pick",
  "tap-number",
  "spell",
  "speed-quiz",
  "survival",
  "mastery",
];

export function ModuleProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [state, setState] = useState<ModuleState>({
    activeLevelId: 1,
    currentPhase: "flashcard",
    phaseIndex: 0,
    gamification: { ...INITIAL_GAMIFICATION },
    completedPhases: [],
  });

  const setLevel = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      activeLevelId: id,
      currentPhase: "flashcard",
      phaseIndex: 0,
      gamification: { ...INITIAL_GAMIFICATION },
      completedPhases: [],
    }));
  }, []);

  const goToPhase = useCallback((id: PhaseId) => {
    setState((prev) => ({
      ...prev,
      currentPhase: id,
      phaseIndex: PHASE_ORDER.indexOf(id),
    }));
  }, []);

  const nextPhase = useCallback(() => {
    setState((prev) => {
      const nextIdx = prev.phaseIndex + 1;
      if (nextIdx >= PHASE_ORDER.length) return prev;
      return {
        ...prev,
        currentPhase: PHASE_ORDER[nextIdx],
        phaseIndex: nextIdx,
        completedPhases: [...prev.completedPhases, prev.currentPhase],
      };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState((prev) => {
      const newXp = prev.gamification.xp + amount;
      const newLevel = Math.min(10, Math.floor(newXp / 100) + 1);
      return {
        ...prev,
        gamification: { ...prev.gamification, xp: newXp, level: newLevel },
      };
    });
  }, []);

  const loseLife = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gamification: {
        ...prev.gamification,
        lives: Math.max(0, prev.gamification.lives - 1),
      },
    }));
  }, []);

  const addStreak = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gamification: {
        ...prev.gamification,
        streak: prev.gamification.streak + 1,
      },
    }));
  }, []);

  const resetStreak = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gamification: { ...prev.gamification, streak: 0 },
    }));
  }, []);

  const resetModule = useCallback(() => {
    setState({
      activeLevelId: 1,
      currentPhase: "flashcard",
      phaseIndex: 0,
      gamification: { ...INITIAL_GAMIFICATION },
      completedPhases: [],
    });
  }, []);

  return (
    <ModuleContext.Provider
      value={{
        state,
        setLevel,
        goToPhase,
        nextPhase,
        addXp,
        loseLife,
        addStreak,
        resetStreak,
        resetModule,
        activeModule,
        setActiveModule,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule(): ModuleContextValue {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModule must be used within ModuleProvider");
  return ctx;
}
