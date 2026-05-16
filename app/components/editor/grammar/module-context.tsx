"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  GrammarModuleState,
  GrammarPhaseId,
  GamificationState,
  CefrLevel,
  GrammarExercise,
} from "./types";
import { getLessonById } from "./grammar-data";

const INITIAL_GAMIFICATION: GamificationState = {
  xp: 0,
  lives: 3,
  streak: 0,
  level: 1,
};

const PHASE_ORDER: GrammarPhaseId[] = [
  "dashboard",
  "lesson",
  "practice",
  "results",
];

interface GrammarContextValue {
  state: GrammarModuleState;
  setCefrLevel: (level: CefrLevel) => void;
  startLesson: (lessonId: string) => void;
  goToPhase: (id: GrammarPhaseId) => void;
  nextPhase: () => void;
  submitExercise: (
    exercise: GrammarExercise,
    isCorrect: boolean,
  ) => void;
  addXp: (amount: number) => void;
  loseLife: () => void;
  addStreak: () => void;
  resetStreak: () => void;
  resetModule: () => void;
  returnToDashboard: () => void;
}

const GrammarContext = createContext<GrammarContextValue | null>(null);

export function GrammarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GrammarModuleState>({
    activeCefrLevel: "A1",
    currentPhase: "dashboard",
    phaseIndex: 0,
    activeLessonId: null,
    currentExerciseIndex: 0,
    completedLessonIds: [],
    exerciseResults: {},
    lessonProgress: {},
    gamification: { ...INITIAL_GAMIFICATION },
  });

  const setCefrLevel = useCallback((level: CefrLevel) => {
    setState((prev) => ({
      ...prev,
      activeCefrLevel: level,
      currentPhase: "dashboard",
      phaseIndex: 0,
      activeLessonId: null,
      currentExerciseIndex: 0,
    }));
  }, []);

  const startLesson = useCallback((lessonId: string) => {
    setState((prev) => ({
      ...prev,
      activeLessonId: lessonId,
      currentPhase: "lesson",
      phaseIndex: PHASE_ORDER.indexOf("lesson"),
      currentExerciseIndex: 0,
      exerciseResults: {},
    }));
  }, []);

  const goToPhase = useCallback((id: GrammarPhaseId) => {
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
      };
    });
  }, []);

  const submitExercise = useCallback(
    (exercise: GrammarExercise, isCorrect: boolean) => {
      setState((prev) => {
        const lesson = prev.activeLessonId
          ? getLessonById(prev.activeLessonId)
          : undefined;
        const totalExercises = lesson?.exercises.length ?? 0;
        const earnedPoints = isCorrect ? exercise.points : 0;

        const newResults = {
          ...prev.exerciseResults,
          [exercise.id]: { correct: isCorrect, points: earnedPoints },
        };

        const nextIndex = prev.currentExerciseIndex + 1;
        const isLessonComplete = nextIndex >= totalExercises;

        const newCompletedIds = isLessonComplete
          ? prev.completedLessonIds.includes(prev.activeLessonId ?? "")
            ? prev.completedLessonIds
            : [...prev.completedLessonIds, prev.activeLessonId ?? ""]
          : prev.completedLessonIds;

        const newGamification = {
          ...prev.gamification,
          xp: prev.gamification.xp + earnedPoints,
          level: Math.min(
            10,
            Math.floor(
              (prev.gamification.xp + earnedPoints) / 100,
            ) + 1,
          ),
          ...(isCorrect ? {} : { lives: Math.max(0, prev.gamification.lives - 1) }),
        };

        return {
          ...prev,
          currentExerciseIndex: isLessonComplete
            ? prev.currentExerciseIndex
            : nextIndex,
          exerciseResults: newResults,
          completedLessonIds: newCompletedIds,
          gamification: newGamification,
        };
      });
    },
    [],
  );

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
      activeCefrLevel: "A1",
      currentPhase: "dashboard",
      phaseIndex: 0,
      activeLessonId: null,
      currentExerciseIndex: 0,
      completedLessonIds: [],
      exerciseResults: {},
      lessonProgress: {},
      gamification: { ...INITIAL_GAMIFICATION },
    });
  }, []);

  const returnToDashboard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPhase: "dashboard",
      phaseIndex: 0,
      activeLessonId: null,
      currentExerciseIndex: 0,
      exerciseResults: {},
    }));
  }, []);

  return (
    <GrammarContext.Provider
      value={{
        state,
        setCefrLevel,
        startLesson,
        goToPhase,
        nextPhase,
        submitExercise,
        addXp,
        loseLife,
        addStreak,
        resetStreak,
        resetModule,
        returnToDashboard,
      }}
    >
      {children}
    </GrammarContext.Provider>
  );
}

export function useGrammar(): GrammarContextValue {
  const ctx = useContext(GrammarContext);
  if (!ctx)
    throw new Error("useGrammar must be used within GrammarProvider");
  return ctx;
}
