import { z } from "zod";

export const CONTENT_SCHEMA_VERSION = "1.0.0";

const languageCodes = [
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
] as const;

const levelCodes = ["N5", "N4", "N3", "N2", "N1", "A1", "A2", "B1", "B2", "C1"] as const;

const questionType = z.enum([
  "multiple_choice",
  "fill_blank",
  "ordering",
  "matching",
  "kanji_reading",
  "reading_comprehension",
  "listening_comprehension",
  "correction",
]);

const choiceSchema = z
  .object({
    id: z.string().min(1).max(40),
    label: z.string().min(1).max(500),
  })
  .strict();

const questionSchema = z
  .object({
    id: z.string().min(3).max(180),
    position: z.number().int().min(1),
    type: questionType,
    skill: z.string().min(1).max(40),
    prompt: z.string().min(1).max(2000),
    promptSupport: z.record(z.string(), z.unknown()).optional(),
    choices: z.array(choiceSchema).max(8).optional(),
    answerKey: z.record(z.string(), z.unknown()),
    explanations: z.record(z.string(), z.string()).refine(
      (value) => Boolean(value.en?.trim()) && Boolean(value.id?.trim()),
      { message: "explanations must include non-empty en and id" },
    ),
    conceptKey: z.string().min(1).max(160),
    difficulty: z.number().int().min(1).max(5).default(1),
    tags: z.array(z.string().min(1).max(40)).max(12).default([]),
    source: z.string().max(200).optional(),
    license: z.string().max(80).optional(),
    audioUrl: z.string().url().optional(),
    transcript: z.string().max(5000).optional(),
    status: z.enum(["draft", "in_review", "published"]).optional(),
    generation: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .superRefine((question, context) => {
    if (question.type === "multiple_choice" || question.type === "kanji_reading") {
      if (!question.choices || question.choices.length < 2) {
        context.addIssue({
          code: "custom",
          path: ["choices"],
          message: "choice-based questions need at least two choices",
        });
      }
      if (typeof question.answerKey.choiceId !== "string") {
        context.addIssue({
          code: "custom",
          path: ["answerKey"],
          message: "choice-based questions need answerKey.choiceId",
        });
      }
    }

    if (question.type === "ordering") {
      if (!Array.isArray(question.answerKey.order)) {
        context.addIssue({
          code: "custom",
          path: ["answerKey"],
          message: "ordering questions need answerKey.order",
        });
      }
    }

    if (question.type === "fill_blank" || question.type === "correction") {
      if (!Array.isArray(question.answerKey.accepted)) {
        context.addIssue({
          code: "custom",
          path: ["answerKey"],
          message: "fill/correction questions need answerKey.accepted",
        });
      }
    }

    const furigana = question.promptSupport?.furigana;
    if (Array.isArray(furigana)) {
      for (const entry of furigana) {
        if (
          entry &&
          typeof entry === "object" &&
          "surface" in entry &&
          typeof entry.surface === "string" &&
          !question.prompt.includes(entry.surface)
        ) {
          context.addIssue({
            code: "custom",
            path: ["promptSupport", "furigana"],
            message: `furigana surface "${entry.surface}" is missing from prompt`,
          });
        }
      }
    }
  });

const passageSchema = z
  .object({
    id: z.string().min(3).max(180),
    kind: z.enum(["reading", "listening"]).default("reading"),
    title: z.string().min(1).max(300),
    body: z.string().min(1).max(10000).optional(),
    translation: z.string().max(10000).optional(),
    audioUrl: z.string().url().optional(),
    transcript: z.string().max(10000).optional(),
    difficulty: z.number().int().min(1).max(5).default(1),
  })
  .strict();

const materialSchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    objective: z.string().min(1).max(1000).optional(),
    blocks: z.array(z.record(z.string(), z.unknown())).min(1),
  })
  .strict();

const lessonSchema = z
  .object({
    id: z.string().min(3).max(180),
    position: z.number().int().min(1).max(12),
    slug: z.string().min(1).max(120),
    title: z.string().min(1).max(300),
    objective: z.string().min(1).max(1000),
    skill: z.string().min(1).max(40),
    kind: z.string().max(40).default("lesson"),
    estimatedMinutes: z.number().int().min(3).max(60).default(8),
    status: z.enum(["draft", "in_review", "published"]).default("published"),
    materials: z.record(z.string(), materialSchema).default({}),
    passages: z.array(passageSchema).max(20).default([]),
    questions: z.array(questionSchema).min(1).max(60),
  })
  .strict();

export const unitFileSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    contentVersion: z.string().regex(/^\d{4}\.\d{2}\.\d+$/, "contentVersion must look like 2026.11.0"),
    language: z.enum(languageCodes),
    framework: z.enum(["JLPT", "CEFR"]),
    level: z.enum(levelCodes),
    status: z.enum(["draft", "in_review", "published"]).default("published"),
    unit: z
      .object({
        id: z.string().min(3).max(180),
        position: z.number().int().min(1).max(12),
        title: z.string().min(1).max(300),
        goal: z.string().min(1).max(1000),
        checkpointQuestionCount: z.number().int().min(0).max(100).default(20),
      })
      .strict(),
    lessons: z.array(lessonSchema).min(1).max(8),
  })
  .strict()
  .superRefine((file, context) => {
    const expectedFramework = file.language === "ja" ? "JLPT" : "CEFR";
    if (file.framework !== expectedFramework) {
      context.addIssue({
        code: "custom",
        path: ["framework"],
        message: `${file.language} must use ${expectedFramework}`,
      });
    }

    const isJlptLevel = file.level.startsWith("N");
    if (expectedFramework === "JLPT" && !isJlptLevel) {
      context.addIssue({
        code: "custom",
        path: ["level"],
        message: "JLPT content must use N5–N1 levels",
      });
    }
    if (expectedFramework === "CEFR" && isJlptLevel) {
      context.addIssue({
        code: "custom",
        path: ["level"],
        message: "CEFR content must use A1–C1 levels",
      });
    }

    if (!file.unit.id.startsWith(`${file.language}-`)) {
      context.addIssue({
        code: "custom",
        path: ["unit", "id"],
        message: "unit id must start with the language code",
      });
    }

    const lessonIds = new Set<string>();
    for (const lesson of file.lessons) {
      if (lessonIds.has(lesson.id)) {
        context.addIssue({
          code: "custom",
          path: ["lessons"],
          message: `duplicate lesson id ${lesson.id}`,
        });
      }
      lessonIds.add(lesson.id);

      const positions = new Set<number>();
      for (const question of lesson.questions) {
        if (positions.has(question.position)) {
          context.addIssue({
            code: "custom",
            path: ["lessons", lesson.id, "questions"],
            message: `duplicate question position ${question.position}`,
          });
        }
        positions.add(question.position);

        if (question.type === "multiple_choice" || question.type === "kanji_reading") {
          const ids = (question.choices ?? []).map((choice) => choice.id);
          if (new Set(ids).size !== ids.length) {
            context.addIssue({
              code: "custom",
              path: ["lessons", lesson.id, "questions", question.id],
              message: "duplicate choice id",
            });
          }
          if (
            typeof question.answerKey.choiceId === "string" &&
            !ids.includes(question.answerKey.choiceId)
          ) {
            context.addIssue({
              code: "custom",
              path: ["lessons", lesson.id, "questions", question.id],
              message: "answerKey.choiceId is not one of the choices",
            });
          }
        }
      }
    }
  });

export type UnitFile = z.infer<typeof unitFileSchema>;
export type ContentQuestion = z.infer<typeof questionSchema>;
export type ContentLesson = z.infer<typeof lessonSchema>;
