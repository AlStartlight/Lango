export type PhaseId =
  | "flashcard"
  | "listen-pick"
  | "tap-number"
  | "spell"
  | "speed-quiz"
  | "survival"
  | "mastery";

export interface PhaseDef {
  id: PhaseId;
  label: string;
  description: string;
}

export interface NumberLevel {
  id: number;
  label: string;
  numbers: number[];
}

export interface GamificationState {
  xp: number;
  lives: number;
  streak: number;
  level: number;
}

export interface ModuleState {
  activeLevelId: number;
  currentPhase: PhaseId;
  phaseIndex: number;
  gamification: GamificationState;
  completedPhases: PhaseId[];
}

export interface FlashcardData {
  number: number;
  word: string;
  isFlipped: boolean;
}

export interface ListenPickQuestion {
  answer: number;
  options: number[];
}

export interface SpellQuestion {
  number: number;
  word: string;
  scrambledLetters: string[];
  hintUsed: boolean;
}

export interface SpeedQuizQuestion {
  number: number;
  word: string;
  answer: number;
  options: number[];
  /** listen = hear audio & pick number, see = see number & pick name, type = see name & type number */
  type: "listen" | "see" | "type";
}

/** Options for generating speed quiz questions */
export type SpeedQuizType = "listen" | "see" | "type";
export const SPEED_QUIZ_TYPES: SpeedQuizType[] = ["listen", "see", "type"];

export interface MasteryResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  breakdown: { correct: number; total: number; phase: PhaseId }[];
}

export interface TapQuestion {
  answer: number;
  grid: number[];
}

export type LanguageCode =
  | "en" | "es" | "fr" | "de" | "it" | "nl" | "pt"
  | "ar" | "hi" | "bn" | "id" | "ja" | "ko" | "zh"
  | "ru" | "sv" | "da" | "fi" | "no" | "pl" | "tr";

export const PHASES: PhaseDef[] = [
  { id: "flashcard", label: "Number Flashcard", description: "Tap cards to learn numbers" },
  { id: "listen-pick", label: "Listen & Pick", description: "Hear the number, choose the right one" },
  { id: "tap-number", label: "Tap the Number", description: "Find the number before time runs out" },
  { id: "spell", label: "Spell the Number", description: "Arrange letters to spell the number" },
  { id: "speed-quiz", label: "Speed Quiz", description: "Answer quickly under pressure" },
  { id: "survival", label: "Survival Mode", description: "Stay alive as long as you can" },
  { id: "mastery", label: "Mastery Test", description: "Prove you've mastered this level" },
];

export const LEVELS: NumberLevel[] = [
  { id: 1, label: "0–10", numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { id: 2, label: "11–20", numbers: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { id: 3, label: "Tens (20–90)", numbers: [20, 30, 40, 50, 60, 70, 80, 90] },
  { id: 4, label: "21–99", numbers: [21, 32, 43, 54, 65, 76, 87, 98] },
  { id: 5, label: "100–900", numbers: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: 6, label: "Thousands", numbers: [1000, 2000, 5000, 9999] },
  { id: 7, label: "Millions", numbers: [1_000_000, 2_500_000, 10_000_000] },
];
