import type {
  Availability,
  CurriculumLevelCode,
  Framework,
  LanguageCode,
  QuestionType,
} from "@/lib/i18n/locales";

export interface CurriculumLevelSummary {
  code: CurriculumLevelCode;
  position: number;
  title: string;
  description: string | null;
  canDo: string[];
  estimatedHours: number | null;
  lessons: number;
  questions: number;
}

export interface CurriculumSummary {
  id: string;
  languageCode: LanguageCode;
  framework: Framework;
  variant: string;
  version: string;
  status: Availability;
  totalQuestions: number;
  totalLessons: number;
  levels: CurriculumLevelSummary[];
}

export interface LessonProgressDto {
  status: "not_started" | "in_progress" | "completed" | "mastered";
  bestAccuracy: number;
  currentExerciseIndex: number;
  lastQuestionId: string | null;
}

export interface LessonSummary {
  id: string;
  level: CurriculumLevelCode;
  unitId: string;
  unitTitle: string;
  position: number;
  title: string;
  objective: string;
  skill: string;
  estimatedMinutes: number;
  questionCount: number;
  progress: LessonProgressDto;
}

export interface QuestionChoiceDto {
  id: string;
  label: string;
}

export interface QuestionDto {
  id: string;
  type: QuestionType;
  skill: string;
  prompt: string;
  promptSupport: unknown | null;
  position: number;
  passage?: {
    id: string;
    title: string;
    body: string | null;
    translation: string | null;
    audioUrl: string | null;
  } | null;
  audioUrl?: string | null;
  choices: QuestionChoiceDto[];
  /** Server-only fields are intentionally absent from the DTO. */
}

export interface LessonMaterialBlock {
  type: "explanation" | "rules" | "examples" | "tips" | string;
  text?: string;
  items?: unknown[];
}

export interface LessonDetailDto {
  id: string;
  title: string;
  objective: string;
  level: CurriculumLevelCode;
  skill: string;
  estimatedMinutes: number;
  contentVersion: string;
  languageCode: LanguageCode;
  materials: LessonMaterialBlock[];
  explanationLocale: string;
  questions: QuestionDto[];
  progress: LessonProgressDto;
}

export interface AttemptStats {
  xpTotal: number;
  level: number;
  hearts: number;
  streakCurrent?: number;
}

export interface AttemptResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  explanationLocale: string;
  xpAwarded: number;
  stats: AttemptStats;
  idempotent?: boolean;
}

export interface LessonCompletionResult {
  lessonId: string;
  accuracy: number;
  correct: number;
  total: number;
  xpAwarded: number;
  xpTotal: number;
  level: number;
}

export interface LanguageAvailability {
  code: LanguageCode;
  status: Availability;
  totalQuestions: number;
  totalLessons: number;
  levels: number;
}

export interface CurriculumProgressLevel {
  code: CurriculumLevelCode;
  title: string;
  lessons: number;
  completedLessons: number;
  questions: number;
}

export interface CurriculumProgress {
  languageCode: LanguageCode;
  totalLessons: number;
  completedLessons: number;
  masteredLessons: number;
  accuracyPercent: number;
  levels: CurriculumProgressLevel[];
}
