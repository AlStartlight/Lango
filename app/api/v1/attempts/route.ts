import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { CurriculumAttemptSchema } from "@/lib/auth/validation";
import { GrammarAttemptSchema } from "@/lib/learning/schemas";
import {
  correctAnswerText,
  getExerciseCatalogEntry,
  lessonConceptKey,
  validateGrammarAnswer,
} from "@/lib/learning/grammar";
import { awardXp, touchStreak } from "@/lib/learning/progress";
import { submitCurriculumAttempt } from "@/lib/learning/content-repository";
import { isContentLanguage } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  if (!prisma) {
    return authError(
      "Database belum dikonfigurasi.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  const limit = checkRateLimit(`attempt:${context.user.id}`, 120, 60 * 1000);
  if (!limit.allowed) {
    return authError(
      "Terlalu banyak jawaban dalam waktu singkat.",
      429,
      "RATE_LIMITED",
    );
  }

  const body = await request.json().catch(() => null);

  // Curriculum questions are identified by `questionId`; legacy Grammar
  // exercises keep using `exerciseId` on the same endpoint.
  if (body && typeof body === "object" && "questionId" in body) {
    const parsed = CurriculumAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return authError(
        firstZodMessage(parsed.error),
        400,
        "VALIDATION_ERROR",
      );
    }

    const result = await submitCurriculumAttempt({
      userId: context.user.id,
      timezone: context.user.timezone,
      clientAttemptId: parsed.data.clientAttemptId,
      questionId: parsed.data.questionId,
      answer: parsed.data.answer,
      timeSpentMs: parsed.data.timeSpentMs,
      explanationLocale: isContentLanguage(context.user.explanationLocale)
        ? context.user.explanationLocale
        : "en",
    });

    if ("error" in result) {
      if (result.error === "NOT_PUBLISHED") {
        return authError(
          "Soal ini sudah tidak tersedia.",
          410,
          "QUESTION_RETIRED",
        );
      }
      return authError("Soal tidak ditemukan.", 404, "NOT_FOUND");
    }

    return authOk(result);
  }

  const parsed = GrammarAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      firstZodMessage(parsed.error),
      400,
      "VALIDATION_ERROR",
    );
  }

  const entry = getExerciseCatalogEntry(parsed.data.exerciseId);
  if (!entry) {
    return authError("Latihan tidak ditemukan.", 404, "NOT_FOUND");
  }

  const { lesson, exercise } = entry;
  const correct = validateGrammarAnswer(exercise, parsed.data.answer);

  const existing = await prisma.exerciseAttempt.findUnique({
    where: {
      userId_clientAttemptId: {
        userId: context.user.id,
        clientAttemptId: parsed.data.clientAttemptId,
      },
    },
  });

  if (existing) {
    const stats = await prisma.userStats.findUnique({
      where: { userId: context.user.id },
    });
    return authOk({
      correct: existing.isCorrect,
      correctAnswer: correctAnswerText(exercise),
      explanation: exercise.explanation,
      xpAwarded: existing.xpAwarded,
      stats: {
        xpTotal: stats?.xpTotal ?? 0,
        level: stats?.level ?? 1,
        hearts: stats?.hearts ?? 5,
      },
      idempotent: true,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const previousCorrect = await tx.exerciseAttempt.count({
      where: {
        userId: context.user.id,
        exerciseId: exercise.id,
        isCorrect: true,
      },
    });
    const previousAttempts = await tx.exerciseAttempt.count({
      where: {
        userId: context.user.id,
        exerciseId: exercise.id,
      },
    });

    const baseXp = correct ? 10 : 0;
    const firstCorrectBonus = correct && previousCorrect === 0 ? 5 : 0;
    const xp = await awardXp(tx, {
      userId: context.user.id,
      amount: baseXp + firstCorrectBonus,
      sourceType: "grammar_attempt",
      sourceId: exercise.id,
      idempotencyKey: `attempt:${context.user.id}:${parsed.data.clientAttemptId}`,
      timezone: context.user.timezone,
    });

    await tx.exerciseAttempt.create({
      data: {
        clientAttemptId: parsed.data.clientAttemptId,
        userId: context.user.id,
        exerciseId: exercise.id,
        lessonId: lesson.id,
        answer: { text: parsed.data.answer },
        isCorrect: correct,
        score: correct ? 100 : 0,
        timeSpentMs: parsed.data.timeSpentMs,
        attemptNumber: previousAttempts + 1,
        xpAwarded: xp.awarded,
      },
    });

    const existingProgress = await tx.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: context.user.id,
          lessonId: lesson.id,
        },
      },
    });
    const keepCompleted =
      existingProgress?.status === "completed" ||
      existingProgress?.status === "mastered";

    await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: context.user.id,
          lessonId: lesson.id,
        },
      },
      update: {
        status: keepCompleted ? existingProgress!.status : "in_progress",
        attemptCount: { increment: 1 },
        ...(parsed.data.exerciseIndex !== undefined
          ? { currentExerciseIndex: parsed.data.exerciseIndex }
          : {}),
        startedAt: existingProgress?.startedAt ?? new Date(),
      },
      create: {
        userId: context.user.id,
        lessonId: lesson.id,
        status: "in_progress",
        attemptCount: 1,
        currentExerciseIndex: parsed.data.exerciseIndex ?? 0,
        startedAt: new Date(),
      },
    });

    const conceptKey = lessonConceptKey(lesson);
    if (!correct) {
      await tx.spacedReviewItem.upsert({
        where: {
          userId_conceptKey: {
            userId: context.user.id,
            conceptKey,
          },
        },
        update: {
          lapses: { increment: 1 },
          intervalDays: 1,
          dueAt: new Date(Date.now() + 86_400_000),
          priority: "high",
          status: "active",
          sourceId: lesson.id,
        },
        create: {
          userId: context.user.id,
          moduleId: "grammar",
          conceptKey,
          sourceType: "grammar_lesson",
          sourceId: lesson.id,
          intervalDays: 1,
          dueAt: new Date(Date.now() + 86_400_000),
          lapses: 1,
          priority: "high",
        },
      });
    }

    const streak = await touchStreak(tx, context.user.id, context.user.timezone);
    const stats = await tx.userStats.findUnique({
      where: { userId: context.user.id },
    });

    return {
      xpAwarded: xp.awarded,
      stats: {
        xpTotal: stats?.xpTotal ?? 0,
        level: stats?.level ?? 1,
        hearts: stats?.hearts ?? 5,
        streakCurrent: streak.streakCurrent,
      },
    };
  });

  return authOk({
    correct,
    correctAnswer: correctAnswerText(exercise),
    explanation: exercise.explanation,
    xpAwarded: result.xpAwarded,
    stats: result.stats,
  });
}
