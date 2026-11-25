/**
 * Domain types for the Visa Kerja interview-practice module.
 *
 * Content is authored as JSON in `content/interview/`. These types are the
 * contract shared by the loader, the deterministic evaluator, the API routes,
 * and the UI.
 */

export const INTERVIEW_TRACK_IDS = [
  "screening",
  "behavioral",
  "technical",
  "case",
  "closing",
  "panel",
] as const;

export type InterviewTrackId = (typeof INTERVIEW_TRACK_IDS)[number];

export type InterviewMode = "drill" | "simulation";

/** Content languages that actually ship a question bank today. */
export const INTERVIEW_LANGUAGES = ["en", "id", "ja"] as const;
export type InterviewLanguage = (typeof INTERVIEW_LANGUAGES)[number];

export interface InterviewKeyPhrase {
  target: string;
  note: string;
}

export interface InterviewQuestion {
  canonicalId: string;
  track: InterviewTrackId;
  rolePack: string;
  level: string;
  prompt: string;
  translation: string;
  romanization: string | null;
  competencies: string[];
  expectedLengthSec: [number, number];
  timeLimitSec: number;
  followUps: string[];
  skeleton: string[];
  modelAnswer: string;
  keyPhrases: InterviewKeyPhrase[];
  rubricPoints: string[];
  redFlags: string[];
  culturalNote: string;
  /** Tokens used by the rule-based evaluator for relevance. */
  keywords: string[];
}

export interface InterviewQuestionPublic {
  canonicalId: string;
  track: InterviewTrackId;
  level: string;
  prompt: string;
  translation: string;
  romanization: string | null;
  expectedLengthSec: [number, number];
  timeLimitSec: number;
  competencies: string[];
}

export interface InterviewTrack {
  id: InterviewTrackId;
  label: Record<InterviewLanguage, string>;
  level: string;
  minutes: number;
}

export interface InterviewScores {
  content: number;
  structure: number;
  evidence: number;
  language: number;
  delivery: number;
}

export const INTERVIEW_WEIGHTS: Record<keyof InterviewScores, number> = {
  content: 0.25,
  structure: 0.2,
  evidence: 0.2,
  language: 0.2,
  delivery: 0.15,
};

export const INTERVIEW_DIMENSIONS = [
  "content",
  "structure",
  "evidence",
  "language",
  "delivery",
] as const;

export type InterviewDimension = (typeof INTERVIEW_DIMENSIONS)[number];

/** Feedback is stored as codes so the UI can localize it on the client. */
export const INTERVIEW_FEEDBACK_CODES = [
  "clear_structure",
  "has_metric",
  "good_length",
  "formal_register",
  "personal_contribution",
  "specific_example",
  "add_metric",
  "add_structure",
  "add_result",
  "too_short",
  "too_long",
  "reduce_filler",
  "use_formal_register",
  "use_first_person",
  "add_specifics",
] as const;

export type InterviewFeedbackCode = (typeof INTERVIEW_FEEDBACK_CODES)[number];

export interface InterviewMetrics {
  words: number;
  sentences: number;
  fillerCount: number;
  fillerRatio: number;
  metricCount: number;
  structureGroups: number;
  estimatedSeconds: number;
  register: "formal" | "neutral" | "casual";
}

export interface InterviewEvaluation {
  scores: InterviewScores;
  readiness: number;
  feedback: {
    strengths: InterviewFeedbackCode[];
    improvements: InterviewFeedbackCode[];
  };
  metrics: InterviewMetrics;
}

export interface InterviewTurnRecord {
  id: string;
  questionId: string;
  position: number;
  transcript: string;
  durationMs: number;
  scores: InterviewScores;
  readiness: number;
  feedback: {
    strengths: InterviewFeedbackCode[];
    improvements: InterviewFeedbackCode[];
  };
  metrics: InterviewMetrics;
  createdAt: string;
}

export type InterviewBand =
  | "not_ready"
  | "foundation"
  | "interview_ready"
  | "strong"
  | "excellent";

export const INTERVIEW_BANDS: Array<{
  min: number;
  max: number;
  band: InterviewBand;
}> = [
  { min: 0, max: 39, band: "not_ready" },
  { min: 40, max: 59, band: "foundation" },
  { min: 60, max: 74, band: "interview_ready" },
  { min: 75, max: 89, band: "strong" },
  { min: 90, max: 100, band: "excellent" },
];

export function bandFor(readiness: number): InterviewBand {
  const found = INTERVIEW_BANDS.find(
    (entry) => readiness >= entry.min && readiness <= entry.max,
  );
  return found?.band ?? "not_ready";
}

export function toPublicQuestion(
  question: InterviewQuestion,
): InterviewQuestionPublic {
  return {
    canonicalId: question.canonicalId,
    track: question.track,
    level: question.level,
    prompt: question.prompt,
    translation: question.translation,
    romanization: question.romanization,
    expectedLengthSec: question.expectedLengthSec,
    timeLimitSec: question.timeLimitSec,
    competencies: question.competencies,
  };
}
