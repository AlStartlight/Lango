import { z } from "zod";

export const GrammarAttemptSchema = z.object({
  clientAttemptId: z.string().min(8).max(80),
  exerciseId: z.string().min(1).max(160),
  answer: z.string().max(1000),
  timeSpentMs: z.number().int().min(0).max(30 * 60 * 1000).default(0),
  exerciseIndex: z.number().int().min(0).max(500).optional(),
});

export const LessonCompleteSchema = z.object({
  lessonId: z.string().min(1).max(160),
});

export const NumberAttemptSchema = z.object({
  clientAttemptId: z.string().min(8).max(80),
  languageCode: z.enum([
    "en",
    "es",
    "id",
    "ja",
    "hi",
    "de",
    "ar",
    "fr",
    "pt",
    "it",
    "nl",
    "ko",
  ]),
  value: z.number().int().min(0).max(10_000_000),
  phase: z.enum([
    "flashcard",
    "listen-pick",
    "tap-number",
    "spell",
    "speed-quiz",
    "survival",
    "mastery",
  ]),
  answer: z.union([z.string().max(200), z.number().int()]),
  timeSpentMs: z.number().int().min(0).max(30 * 60 * 1000).default(0),
});
