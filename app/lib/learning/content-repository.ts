import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  availabilityFromCounts,
  defaultLevelForLanguage,
  isCurriculumLevel,
  isLanguageCode,
  normalizeLanguageCode,
  type Availability,
  type CurriculumLevelCode,
  type LanguageCode,
  type QuestionType,
} from "@/lib/i18n/locales";
import { awardXp, touchStreak } from "@/lib/learning/progress";
import type {
  AttemptResult,
  CurriculumProgress,
  CurriculumSummary,
  LanguageAvailability,
  LessonCompletionResult,
  LessonDetailDto,
  LessonMaterialBlock,
  LessonProgressDto,
  LessonSummary,
  QuestionDto,
} from "@/lib/learning/curriculum";

const ANSWERABLE_QUESTION = {
  status: "published",
  OR: [
    { type: { not: "multiple_choice" } },
    { choices: { some: {} } },
  ],
} satisfies Prisma.QuestionWhereInput;

const NOT_STARTED: LessonProgressDto = {
  status: "not_started",
  bestAccuracy: 0,
  currentExerciseIndex: 0,
  lastQuestionId: null,
};

function availabilityOf(
  questions: number,
  lessons: number,
): Availability {
  return availabilityFromCounts(questions, lessons);
}

function jsonObject(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:'"“”‘’\-—–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function progressFrom(
  value:
    | {
        status: string;
        bestAccuracy: number;
        currentExerciseIndex: number;
        lastQuestionId: string | null;
      }
    | null
    | undefined,
): LessonProgressDto {
  if (!value) return NOT_STARTED;
  const status = ["not_started", "in_progress", "completed", "mastered"].includes(
    value.status,
  )
    ? (value.status as LessonProgressDto["status"])
    : "not_started";
  return {
    status,
    bestAccuracy: value.bestAccuracy,
    currentExerciseIndex: value.currentExerciseIndex,
    lastQuestionId: value.lastQuestionId,
  };
}

/** Map language code → published content counts, for 12-language pickers. */
export async function getLanguageAvailability(): Promise<
  Record<LanguageCode, LanguageAvailability>
> {
  const result = Object.fromEntries(
    (["en", "es", "id", "ja", "zh", "hi", "de", "ar", "fr", "pt", "it", "nl", "ko"] as LanguageCode[]).map(
      (code) => [
        code,
        {
          code,
          status: "none" as Availability,
          totalQuestions: 0,
          totalLessons: 0,
          levels: 0,
        },
      ],
    ),
  ) as Record<LanguageCode, LanguageAvailability>;

  if (!prisma) return result;

  const curricula = await prisma.curriculum.findMany({
    where: { status: "published" },
    select: {
      languageCode: true,
      totalQuestions: true,
      totalLessons: true,
      levels: { select: { code: true } },
    },
  });

  for (const curriculum of curricula) {
    const code = normalizeLanguageCode(curriculum.languageCode);
    result[code] = {
      code,
      status: availabilityOf(
        curriculum.totalQuestions,
        curriculum.totalLessons,
      ),
      totalQuestions: curriculum.totalQuestions,
      totalLessons: curriculum.totalLessons,
      levels: curriculum.levels.length,
    };
  }

  return result;
}

export async function getCurriculumSummary(
  language: string,
): Promise<CurriculumSummary | null> {
  if (!prisma || !isLanguageCode(language)) return null;

  const curriculum = await prisma.curriculum.findFirst({
    where: { languageCode: language, status: "published" },
    include: { levels: { orderBy: { position: "asc" } } },
  });

  if (!curriculum) return null;

  const status = availabilityOf(
    curriculum.totalQuestions,
    curriculum.totalLessons,
  );

  return {
    id: curriculum.id,
    languageCode: normalizeLanguageCode(curriculum.languageCode),
    framework:
      curriculum.framework === "JLPT" || curriculum.framework === "HSK"
        ? curriculum.framework
        : "CEFR",
    variant: curriculum.variant,
    version: curriculum.version,
    status,
    totalQuestions: curriculum.totalQuestions,
    totalLessons: curriculum.totalLessons,
    levels: curriculum.levels.map((level) => ({
      code: level.code as CurriculumLevelCode,
      position: level.position,
      title: level.title,
      description: level.description,
      canDo: level.canDo,
      estimatedHours: level.estimatedHours,
      lessons: level.totalLessons,
      questions: level.totalQuestions,
    })),
  };
}

export async function getLessonsForLevel(
  language: string,
  level: string,
  userId: string,
  explanationLocale = "en",
): Promise<LessonSummary[] | null> {
  if (!prisma || !isLanguageCode(language) || !isCurriculumLevel(level)) {
    return null;
  }

  const curriculum = await prisma.curriculum.findFirst({
    where: { languageCode: language, status: "published" },
    include: { levels: { where: { code: level } } },
  });
  const curriculumLevel = curriculum?.levels[0];
  if (!curriculum || !curriculumLevel) return null;

  const lessons = await prisma.curriculumLesson.findMany({
    where: {
      unit: { levelId: curriculumLevel.id },
      status: "published",
      questions: { some: ANSWERABLE_QUESTION },
    },
    include: {
      unit: { select: { id: true, position: true, title: true } },
      localizations: true,
      questions: { where: ANSWERABLE_QUESTION, select: { id: true } },
    },
    orderBy: [{ unit: { position: "asc" } }, { position: "asc" }],
  });

  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId,
      languageCode: language,
      lessonId: { in: lessons.map((lesson) => lesson.id) },
    },
  });
  const progressByLesson = new Map(
    progressRows.map((row) => [row.lessonId, row]),
  );

  const localeChain = [
    explanationLocale,
    "en",
    language,
  ].filter((value, index, all) => value && all.indexOf(value) === index);

  return lessons.map((lesson) => {
    const localization =
      localeChain
        .map((locale) =>
          lesson.localizations.find((entry) => entry.locale === locale),
        )
        .find(Boolean) ?? lesson.localizations[0];
    return {
      id: lesson.id,
      level,
      unitId: lesson.unitId,
      unitTitle: lesson.unit.title,
      position: lesson.position,
      title: localization?.title ?? lesson.title,
      objective: localization?.objective ?? lesson.objective,
      skill: lesson.skill,
      estimatedMinutes: lesson.estimatedMinutes,
      questionCount: lesson.questions.length,
      progress: progressFrom(progressByLesson.get(lesson.id)),
    };
  });
}

function materialBlocks(
  body: Prisma.JsonValue | null,
): LessonMaterialBlock[] {
  const record = jsonObject(body);
  return Array.isArray(record.blocks)
    ? (record.blocks as unknown as LessonMaterialBlock[])
    : [];
}

export async function getLessonDetail(
  lessonId: string,
  userId: string,
  explanationLocale: string,
): Promise<LessonDetailDto | null> {
  if (!prisma) return null;

  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: { include: { level: { include: { curriculum: true } } } },
      localizations: true,
      passages: true,
      questions: {
        where: ANSWERABLE_QUESTION,
        orderBy: { position: "asc" },
        include: {
          choices: { orderBy: { position: "asc" } },
          localizations: true,
          passage: { include: { audio: true } },
          audio: true,
        },
      },
    },
  });

  if (
    !lesson ||
    lesson.status !== "published" ||
    lesson.unit.level.curriculum.status !== "published"
  ) {
    return null;
  }

  const localeChain = [
    explanationLocale,
    "en",
    "id",
    "ja",
    lesson.unit.level.curriculum.languageCode,
  ].filter((value, index, all) => value && all.indexOf(value) === index);

  const localization =
    localeChain
      .map((locale) =>
        lesson.localizations.find((entry) => entry.locale === locale),
      )
      .find(Boolean) ?? lesson.localizations[0];

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const questions: QuestionDto[] = lesson.questions.map((question) => {
    const localizedPrompt = localeChain
      .map((locale) =>
        question.localizations.find((entry) => entry.locale === locale),
      )
      .find((entry) => entry?.prompt)?.prompt;

    return {
      id: question.id,
      type: question.type as QuestionType,
      skill: question.skill,
      prompt: localizedPrompt ?? question.prompt,
      promptSupport: question.promptSupport,
      position: question.position,
      passage: question.passage
        ? {
            id: question.passage.id,
            title: question.passage.title,
            body: question.passage.body,
            translation: question.passage.translation,
            audioUrl: question.passage.audio?.url ?? null,
          }
        : null,
      audioUrl: question.audio?.url ?? null,
      choices: question.choices.map((choice) => ({
        id: choice.id,
        label: choice.label,
      })),
    };
  });

  return {
    id: lesson.id,
    title: localization?.title ?? lesson.title,
    objective: localization?.objective ?? lesson.objective,
    level: lesson.unit.level.code as CurriculumLevelCode,
    skill: lesson.skill,
    estimatedMinutes: lesson.estimatedMinutes,
    contentVersion: lesson.contentVersion,
    languageCode: normalizeLanguageCode(
      lesson.unit.level.curriculum.languageCode,
    ),
    materials: materialBlocks(localization?.body ?? null),
    explanationLocale: localization?.locale ?? "en",
    questions,
    progress: progressFrom(progress),
  };
}

function answerKey(question: { answerKey: Prisma.JsonValue }): Record<string, unknown> {
  return jsonObject(question.answerKey);
}

export function validateCurriculumAnswer(
  question: {
    type: string;
    answerKey: Prisma.JsonValue;
  },
  answer: unknown,
): boolean {
  const key = answerKey(question);

  if (question.type === "ordering") {
    const expected = Array.isArray(key.order)
      ? key.order.map((value) => normalizeText(String(value)))
      : [];
    const submitted =
      typeof answer === "string"
        ? answer
            .split(/\s*[|,]\s*/)
            .map((value) => normalizeText(value))
            .filter(Boolean)
        : Array.isArray((answer as { order?: unknown[] })?.order)
          ? ((answer as { order: unknown[] }).order).map((value) =>
              normalizeText(String(value)),
            )
          : [];
    return (
      expected.length > 0 &&
      expected.length === submitted.length &&
      expected.every((value, index) => value === submitted[index])
    );
  }

  if (question.type === "multiple_choice" || question.type === "kanji_reading" || question.type === "reading_comprehension" || question.type === "listening_comprehension") {
    const submitted =
      typeof answer === "string"
        ? answer
        : typeof (answer as { choiceId?: unknown })?.choiceId === "string"
          ? String((answer as { choiceId: string }).choiceId)
          : "";
    return Boolean(key.choiceId) && submitted.trim() === String(key.choiceId);
  }

  const submitted =
    typeof answer === "string"
      ? answer
      : typeof (answer as { accepted?: unknown })?.accepted === "string"
        ? String((answer as { accepted: string }).accepted)
        : "";
  const accepted = Array.isArray(key.accepted)
    ? key.accepted.map((value) => normalizeText(String(value)))
    : key.value !== undefined
      ? [normalizeText(String(key.value))]
      : [];
  return accepted.length > 0 && accepted.includes(normalizeText(submitted));
}

function correctAnswerText(
  question: {
    type: string;
    answerKey: Prisma.JsonValue;
    choices?: Array<{ id: string; label: string }>;
  },
  locale: string,
  localizations: Array<{ locale: string; explanation: string | null }>,
): { text: string; explanation: string; explanationLocale: string } {
  const key = answerKey(question);
  let text = "";

  if (key.choiceId) {
    text =
      question.choices?.find((choice) => choice.id === String(key.choiceId))
        ?.label ?? String(key.choiceId);
  } else if (Array.isArray(key.order)) {
    text = key.order.map(String).join(" ");
  } else if (Array.isArray(key.accepted)) {
    text = String(key.accepted[0] ?? "");
  } else if (key.value !== undefined) {
    text = String(key.value);
  }

  const localized =
    localizations.find((entry) => entry.locale === locale) ??
    localizations.find((entry) => entry.locale === "en") ??
    localizations[0];

  return {
    text,
    explanation: localized?.explanation ?? "",
    explanationLocale: localized?.locale ?? locale,
  };
}

export async function submitCurriculumAttempt(input: {
  userId: string;
  timezone: string;
  clientAttemptId: string;
  questionId: string;
  answer: unknown;
  timeSpentMs: number;
  explanationLocale: string;
}): Promise<AttemptResult | { error: "NOT_FOUND" | "NOT_PUBLISHED" }> {
  if (!prisma) return { error: "NOT_FOUND" };

  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
    include: {
      choices: { orderBy: { position: "asc" } },
      localizations: true,
      lesson: {
        include: {
          unit: { include: { level: { include: { curriculum: true } } } },
        },
      },
    },
  });

  if (!question) return { error: "NOT_FOUND" };
  if (
    question.status !== "published" ||
    question.lesson.status !== "published" ||
    question.lesson.unit.level.curriculum.status !== "published"
  ) {
    return { error: "NOT_PUBLISHED" };
  }

  const correct = validateCurriculumAnswer(question, input.answer);
  const languageCode = normalizeLanguageCode(
    question.lesson.unit.level.curriculum.languageCode,
  );
  const curriculumId = question.lesson.unit.level.curriculum.id;

  const existing = await prisma.exerciseAttempt.findUnique({
    where: {
      userId_clientAttemptId: {
        userId: input.userId,
        clientAttemptId: input.clientAttemptId,
      },
    },
  });

  if (existing) {
    const stats = await prisma.userStats.findUnique({
      where: { userId: input.userId },
    });
    const explained = correctAnswerText(
      question,
      input.explanationLocale,
      question.localizations,
    );
    return {
      correct: existing.isCorrect,
      correctAnswer: explained.text,
      explanation: explained.explanation,
      explanationLocale: explained.explanationLocale,
      xpAwarded: existing.xpAwarded,
      stats: {
        xpTotal: stats?.xpTotal ?? 0,
        level: stats?.level ?? 1,
        hearts: stats?.hearts ?? 5,
      },
      idempotent: true,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const previousAttempts = await tx.exerciseAttempt.findMany({
      where: { userId: input.userId, exerciseId: question.id },
      select: { isCorrect: true },
    });
    const previousCorrect = previousAttempts.filter((attempt) => attempt.isCorrect).length;

    const xp = await awardXp(tx, {
      userId: input.userId,
      amount: correct ? (previousCorrect === 0 ? 15 : 10) : 0,
      sourceType: "curriculum_attempt",
      sourceId: question.id,
      idempotencyKey: `attempt:${input.userId}:${input.clientAttemptId}`,
      timezone: input.timezone,
    });

    await tx.exerciseAttempt.create({
      data: {
        clientAttemptId: input.clientAttemptId,
        userId: input.userId,
        exerciseId: question.id,
        lessonId: question.lessonId,
        answer: input.answer as Prisma.InputJsonValue,
        isCorrect: correct,
        score: correct ? 100 : 0,
        timeSpentMs: input.timeSpentMs,
        attemptNumber: previousAttempts.length + 1,
        xpAwarded: xp.awarded,
        languageCode,
        curriculumId,
        questionType: question.type,
        questionVersion: question.version,
        answerKeyHash: question.answerKeyHash,
      },
    });

    const existingProgress = await tx.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: input.userId,
          lessonId: question.lessonId,
        },
      },
    });

    await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: input.userId,
          lessonId: question.lessonId,
        },
      },
      update: {
        status:
          existingProgress?.status === "completed" ||
          existingProgress?.status === "mastered"
            ? existingProgress.status
            : "in_progress",
        attemptCount: { increment: 1 },
        currentExerciseIndex: Math.max(
          existingProgress?.currentExerciseIndex ?? 0,
          question.position - 1,
        ),
        lastQuestionId: question.id,
        languageCode,
        curriculumId,
        startedAt: existingProgress?.startedAt ?? new Date(),
      },
      create: {
        userId: input.userId,
        lessonId: question.lessonId,
        status: "in_progress",
        attemptCount: 1,
        currentExerciseIndex: question.position - 1,
        lastQuestionId: question.id,
        languageCode,
        curriculumId,
        startedAt: new Date(),
      },
    });

    if (!correct) {
      await tx.spacedReviewItem.upsert({
        where: {
          userId_conceptKey: {
            userId: input.userId,
            conceptKey: question.conceptKey,
          },
        },
        update: {
          lapses: { increment: 1 },
          intervalDays: 1,
          dueAt: new Date(Date.now() + 86_400_000),
          priority: "high",
          status: "active",
          languageCode,
          curriculumId,
          sourceId: question.id,
        },
        create: {
          userId: input.userId,
          moduleId: "curriculum",
          conceptKey: question.conceptKey,
          sourceType: "curriculum_question",
          sourceId: question.id,
          languageCode,
          curriculumId,
          intervalDays: 1,
          dueAt: new Date(Date.now() + 86_400_000),
          lapses: 1,
          priority: "high",
        },
      });
    }

    const stats = await tx.userStats.findUnique({
      where: { userId: input.userId },
    });
    const languageStats = await tx.userLanguageStats.upsert({
      where: {
        userId_languageCode: {
          userId: input.userId,
          languageCode,
        },
      },
      update: {},
      create: {
        userId: input.userId,
        languageCode,
      },
    });
    const answered = languageStats.questionsAnswered;
    const accuracyPercent = Math.round(
      (languageStats.accuracyPercent * answered + (correct ? 100 : 0)) /
        (answered + 1),
    );
    await tx.userLanguageStats.update({
      where: {
        userId_languageCode: {
          userId: input.userId,
          languageCode,
        },
      },
      data: {
        questionsAnswered: { increment: 1 },
        accuracyPercent,
        lastActivityAt: new Date(),
      },
    });

    const streak = await touchStreak(tx, input.userId, input.timezone);
    return {
      xpAwarded: xp.awarded,
      stats: {
        xpTotal: stats?.xpTotal ?? 0,
        level: stats?.level ?? 1,
        hearts: stats?.hearts ?? 5,
        streakCurrent: streak.streakCurrent,
      },
    };
  }, { timeout: 30_000, maxWait: 10_000 });

  const explained = correctAnswerText(
    question,
    input.explanationLocale,
    question.localizations,
  );

  return {
    correct,
    correctAnswer: explained.text,
    explanation: explained.explanation,
    explanationLocale: explained.explanationLocale,
    xpAwarded: result.xpAwarded,
    stats: result.stats,
  };
}

export async function completeCurriculumLesson(input: {
  userId: string;
  timezone: string;
  lessonId: string;
}): Promise<LessonCompletionResult | { error: "NOT_FOUND" | "LESSON_INCOMPLETE" }> {
  if (!prisma) return { error: "NOT_FOUND" };

  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: input.lessonId },
    include: {
      unit: { include: { level: { include: { curriculum: true } } } },
      questions: {
        where: ANSWERABLE_QUESTION,
        select: { id: true },
      },
    },
  });

  if (
    !lesson ||
    lesson.status !== "published" ||
    lesson.unit.level.curriculum.status !== "published"
  ) {
    return { error: "NOT_FOUND" };
  }

  const attempts = await prisma.exerciseAttempt.findMany({
    where: { userId: input.userId, lessonId: lesson.id },
    orderBy: { createdAt: "desc" },
    select: { exerciseId: true, isCorrect: true },
  });
  const latestByQuestion = new Map<string, boolean>();
  for (const attempt of attempts) {
    if (!latestByQuestion.has(attempt.exerciseId)) {
      latestByQuestion.set(attempt.exerciseId, attempt.isCorrect);
    }
  }

  const total = lesson.questions.length;
  const attempted = latestByQuestion.size;
  if (attempted < total) {
    return { error: "LESSON_INCOMPLETE" };
  }

  const correct = Array.from(latestByQuestion.values()).filter(Boolean).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const languageCode = normalizeLanguageCode(
    lesson.unit.level.curriculum.languageCode,
  );
  const curriculumId = lesson.unit.level.curriculum.id;

  const result = await prisma.$transaction(async (tx) => {
    const existingProgress = await tx.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId: input.userId, lessonId: lesson.id },
      },
    });

    const progress = await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId: input.userId, lessonId: lesson.id },
      },
      update: {
        status: "completed",
        lastAccuracy: accuracy,
        bestAccuracy: Math.max(existingProgress?.bestAccuracy ?? 0, accuracy),
        completedAt: new Date(),
        languageCode,
        curriculumId,
      },
      create: {
        userId: input.userId,
        lessonId: lesson.id,
        status: "completed",
        lastAccuracy: accuracy,
        bestAccuracy: accuracy,
        attemptCount: attempted,
        completedAt: new Date(),
        languageCode,
        curriculumId,
      },
    });

    const xp = await awardXp(tx, {
      userId: input.userId,
      amount: 50,
      sourceType: "curriculum_lesson_complete",
      sourceId: lesson.id,
      idempotencyKey: `lesson-complete:${input.userId}:${lesson.id}`,
      timezone: input.timezone,
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await tx.dailyActivity.upsert({
      where: {
        userId_date: { userId: input.userId, date: today },
      },
      update: { lessonsCompleted: { increment: 1 } },
      create: {
        userId: input.userId,
        date: today,
        lessonsCompleted: 1,
      },
    });

    await tx.userLanguageStats.upsert({
      where: {
        userId_languageCode: { userId: input.userId, languageCode },
      },
      update: {
        lessonsCompleted: { increment: 1 },
        lastActivityAt: new Date(),
      },
      create: {
        userId: input.userId,
        languageCode,
        lessonsCompleted: 1,
        lastActivityAt: new Date(),
      },
    });

    return { progress, xp };
  }, { timeout: 30_000, maxWait: 10_000 });

  return {
    lessonId: lesson.id,
    accuracy,
    correct,
    total,
    xpAwarded: result.xp.awarded,
    xpTotal: result.xp.xpTotal,
    level: result.xp.level,
  };
}

export async function getCurriculumProgress(
  userId: string,
  language: string,
): Promise<CurriculumProgress | null> {
  if (!prisma || !isLanguageCode(language)) return null;

  const curriculum = await prisma.curriculum.findFirst({
    where: { languageCode: language, status: "published" },
    include: {
      levels: {
        orderBy: { position: "asc" },
        include: {
          units: {
            include: {
              lessons: {
                where: {
                  status: "published",
                  questions: { some: ANSWERABLE_QUESTION },
                },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!curriculum) return null;

  const lessonIds = curriculum.levels.flatMap((level) =>
    level.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)),
  );

  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lessonId: { in: lessonIds },
      status: { in: ["completed", "mastered"] },
    },
    select: { lessonId: true, status: true, lastAccuracy: true },
  });
  const completed = new Set(progress.map((row) => row.lessonId));
  const stats = await prisma.userLanguageStats.findUnique({
    where: { userId_languageCode: { userId, languageCode: language } },
  });

  return {
    languageCode: language,
    totalLessons: lessonIds.length,
    completedLessons: completed.size,
    masteredLessons: progress.filter((row) => row.status === "mastered").length,
    accuracyPercent: stats?.accuracyPercent ?? 0,
    levels: curriculum.levels.map((level) => {
      const ids = level.units.flatMap((unit) =>
        unit.lessons.map((lesson) => lesson.id),
      );
      return {
        code: level.code as CurriculumLevelCode,
        title: level.title,
        lessons: ids.length,
        completedLessons: ids.filter((id) => completed.has(id)).length,
        questions: level.totalQuestions,
      };
    }),
  };
}

export async function getStreakStats(userId: string) {
  if (!prisma) return { streakCurrent: 0, streakLongest: 0 };
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  return {
    streakCurrent: stats?.streakCurrent ?? 0,
    streakLongest: stats?.streakLongest ?? 0,
  };
}

export interface HomeToday {
  streakCurrent: number;
  xpTotal: number;
  xpToday: number;
  minutesToday: number;
  goalMinutes: number;
  dueReview: number;
  nextLesson: {
    id: string;
    title: string;
    level: string;
    languageCode: LanguageCode;
    questionCount: number;
  } | null;
}

export async function getHomeToday(input: {
  userId: string;
  language: string;
  level: string | null;
  explanationLocale: string;
  goalMinutes: number;
  timezone: string;
}): Promise<HomeToday> {
  if (!prisma) {
    return {
      streakCurrent: 0,
      xpTotal: 0,
      xpToday: 0,
      minutesToday: 0,
      goalMinutes: input.goalMinutes,
      dueReview: 0,
      nextLesson: null,
    };
  }

  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: input.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const today = new Date(`${todayKey}T00:00:00.000Z`);

  const [stats, activity, dueReview] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId: input.userId } }),
    prisma.dailyActivity.findUnique({
      where: { userId_date: { userId: input.userId, date: today } },
    }),
    prisma.spacedReviewItem.count({
      where: {
        userId: input.userId,
        status: "active",
        dueAt: { lte: new Date() },
        ...(isLanguageCode(input.language)
          ? { languageCode: input.language }
          : {}),
      },
    }),
  ]);

  let nextLesson: HomeToday["nextLesson"] = null;
  if (isLanguageCode(input.language)) {
    const level = input.level && isCurriculumLevel(input.level)
      ? input.level
      : defaultLevelForLanguage(input.language);
    const lessons = await getLessonsForLevel(
      input.language,
      level,
      input.userId,
      input.explanationLocale,
    );
    const candidate =
      lessons?.find(
        (lesson) =>
          lesson.progress.status === "in_progress" ||
          lesson.progress.status === "not_started",
      ) ?? null;

    if (candidate) {
      nextLesson = {
        id: candidate.id,
        title: candidate.title,
        level: candidate.level,
        languageCode: input.language,
        questionCount: candidate.questionCount,
      };
    }
  }

  return {
    streakCurrent: stats?.streakCurrent ?? 0,
    xpTotal: stats?.xpTotal ?? 0,
    xpToday: activity?.xp ?? 0,
    minutesToday: activity?.minutes ?? 0,
    goalMinutes: input.goalMinutes,
    dueReview,
    nextLesson,
  };
}

export interface ReviewQueueItem {
  id: string;
  conceptKey: string;
  sourceType: string;
  moduleId: string;
  dueAt: string;
  priority: string;
  question: {
    id: string;
    prompt: string;
    type: string;
    level: string;
    lessonId: string;
    lessonTitle: string;
    languageCode: LanguageCode;
  } | null;
}

export async function getReviewQueue(
  userId: string,
  language: string | null,
): Promise<ReviewQueueItem[]> {
  if (!prisma) return [];

  const items = await prisma.spacedReviewItem.findMany({
    where: {
      userId,
      status: "active",
      dueAt: { lte: new Date() },
      ...(language && isLanguageCode(language) ? { languageCode: language } : {}),
    },
    orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
    take: 50,
  });

  const questionIds = items
    .filter((item) => item.sourceType === "curriculum_question" && item.sourceId)
    .map((item) => item.sourceId as string);

  const questions = questionIds.length
    ? await prisma.question.findMany({
        where: { id: { in: questionIds } },
        include: {
          localizations: true,
          lesson: {
            include: {
              localizations: true,
              unit: { include: { level: { include: { curriculum: true } } } },
            },
          },
        },
      })
    : [];
  const questionById = new Map(questions.map((question) => [question.id, question]));

  return items.map((item) => {
    const question = item.sourceId ? questionById.get(item.sourceId) : undefined;
    const localization =
      question?.localizations.find((entry) => entry.locale === "id") ??
      question?.localizations.find((entry) => entry.locale === "en");
    return {
      id: item.id,
      conceptKey: item.conceptKey,
      sourceType: item.sourceType,
      moduleId: item.moduleId,
      dueAt: item.dueAt.toISOString(),
      priority: item.priority,
      question:
        question && question.lesson
          ? {
              id: question.id,
              prompt: localization?.prompt ?? question.prompt,
              type: question.type,
              level: question.lesson.unit.level.code,
              lessonId: question.lesson.id,
              lessonTitle:
                question.lesson.localizations.find(
                  (entry) => entry.locale === "id",
                )?.title ??
                question.lesson.localizations.find(
                  (entry) => entry.locale === "en",
                )?.title ??
                question.lesson.title,
              languageCode: normalizeLanguageCode(
                question.lesson.unit.level.curriculum.languageCode,
              ),
            }
          : null,
    };
  });
}
