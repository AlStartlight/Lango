export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type GrammarCategory =
  | "nouns"
  | "pronouns"
  | "verbs"
  | "tenses"
  | "adjectives"
  | "adverbs"
  | "prepositions"
  | "conjunctions"
  | "determiners"
  | "sentence_structure"
  | "modals"
  | "passive"
  | "conditionals"
  | "reported_speech"
  | "questions";

export type ExerciseType =
  | "multiple_choice"
  | "fill_blank"
  | "ordering"
  | "correction";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type GrammarPhaseId =
  | "dashboard"
  | "lesson"
  | "practice"
  | "results";

export interface PhaseDef {
  id: GrammarPhaseId;
  label: string;
}

export interface RuleBlock {
  title: string;
  text: string;
  highlight?: boolean;
}

export interface Example {
  correct: string;
  incorrect?: string;
  annotation?: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface LessonContent {
  explanation: string;
  rules: RuleBlock[];
  examples: Example[];
  tables?: TableData[];
  tips?: string[];
}

export interface GrammarExercise {
  id: string;
  type: ExerciseType;
  question: string;
  context?: string;
  options?: string[];
  correctAnswer: string | string[];
  answerVariants?: string[];
  hint?: string;
  explanation: string;
  points: number;
}

export interface GrammarLesson {
  id: string;
  title: string;
  description: string;
  category: GrammarCategory;
  categoryLabel: string;
  cefrLevel: CefrLevel;
  difficulty: DifficultyLevel;
  content: LessonContent;
  exercises: GrammarExercise[];
}

export interface CefrLevelDef {
  id: CefrLevel;
  label: string;
  description: string;
}

export interface LessonProgress {
  lessonId: string;
  status: "not_started" | "in_progress" | "completed" | "mastered";
  bestScore: number;
  lastScore: number;
  attemptCount: number;
  completedExercises: number;
  totalExercises: number;
}

export interface GamificationState {
  xp: number;
  lives: number;
  streak: number;
  level: number;
}

export interface GrammarModuleState {
  activeCefrLevel: CefrLevel;
  currentPhase: GrammarPhaseId;
  phaseIndex: number;
  activeLessonId: string | null;
  currentExerciseIndex: number;
  completedLessonIds: string[];
  exerciseResults: Record<string, { correct: boolean; points: number }>;
  lessonProgress: Record<string, LessonProgress>;
  gamification: GamificationState;
}

export const CEFR_LEVELS: CefrLevelDef[] = [
  {
    id: "A1",
    label: "A1 Beginner",
    description: "Basic words and simple sentences",
  },
  {
    id: "A2",
    label: "A2 Elementary",
    description: "Common phrases and everyday expressions",
  },
  {
    id: "B1",
    label: "B1 Intermediate",
    description: "Main points on familiar topics",
  },
  {
    id: "B2",
    label: "B2 Upper Intermediate",
    description: "Complex texts and fluent conversation",
  },
  {
    id: "C1",
    label: "C1 Advanced",
    description: "Demanding texts and nuanced expression",
  },
];

export const PHASES: PhaseDef[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "lesson", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "results", label: "Results" },
];

export const CATEGORY_LABELS: Record<GrammarCategory, string> = {
  nouns: "Nouns",
  pronouns: "Pronouns",
  verbs: "Verbs",
  tenses: "Verb Tenses",
  adjectives: "Adjectives",
  adverbs: "Adverbs",
  prepositions: "Prepositions",
  conjunctions: "Conjunctions",
  determiners: "Determiners",
  sentence_structure: "Sentence Structure",
  modals: "Modal Verbs",
  passive: "Passive Voice",
  conditionals: "Conditionals",
  reported_speech: "Reported Speech",
  questions: "Questions",
};
