import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { LessonCompleteSchema } from "@/lib/learning/schemas";
import { getLessonCatalogEntry } from "@/lib/learning/grammar";
import { completeCurriculumLesson } from "@/lib/learning/content-repository";
import { awardXp } from "@/lib/learning/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const body = await request.json().catch(() => null);
  const parsed = LessonCompleteSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      firstZodMessage(parsed.error),
      400,
      "VALIDATION_ERROR",
    );
  }

  const { id } = await params;
  // The URL id wins over a stale/duplicate body id.
  const lessonId = decodeURIComponent(id) || parsed.data.lessonId;

  const legacyLesson = getLessonCatalogEntry(lessonId);
  if (!legacyLesson) {
    const result = await completeCurriculumLesson({
      userId: context.user.id,
      timezone: context.user.timezone,
      lessonId,
    });

    if ("error" in result) {
      if (result.error === "LESSON_INCOMPLETE") {
        return authError(
          "Selesaikan semua latihan sebelum menutup pelajaran.",
          400,
          "LESSON_INCOMPLETE",
        );
      }
      return authError("Pelajaran tidak ditemukan.", 404, "NOT_FOUND");
    }

    return authOk(result);
  }

  const lesson = legacyLesson;

  const attempts = await prisma.exerciseAttempt.findMany({
    where: { userId: context.user.id, lessonId: lesson.id },
    orderBy: { createdAt: "desc" },
    select: { exerciseId: true, isCorrect: true },
  });

  const latestByExercise = new Map<string, boolean>();
  for (const attempt of attempts) {
    if (!latestByExercise.has(attempt.exerciseId)) {
      latestByExercise.set(attempt.exerciseId, attempt.isCorrect);
    }
  }

  const attempted = latestByExercise.size;
  const correct = Array.from(latestByExercise.values()).filter(Boolean).length;
  const accuracy =
    lesson.exercises.length > 0
      ? Math.round((correct / lesson.exercises.length) * 100)
      : 0;

  if (attempted < lesson.exercises.length) {
    return authError(
      "Selesaikan semua latihan sebelum menutup pelajaran.",
      400,
      "LESSON_INCOMPLETE",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingProgress = await tx.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId: context.user.id, lessonId: lesson.id },
      },
    });

    const progress = await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: context.user.id,
          lessonId: lesson.id,
        },
      },
      update: {
        status: "completed",
        lastAccuracy: accuracy,
        bestAccuracy: Math.max(existingProgress?.bestAccuracy ?? 0, accuracy),
        completedAt: new Date(),
      },
      create: {
        userId: context.user.id,
        lessonId: lesson.id,
        status: "completed",
        lastAccuracy: accuracy,
        bestAccuracy: accuracy,
        attemptCount: attempted,
        completedAt: new Date(),
      },
    });

    const xp = await awardXp(tx, {
      userId: context.user.id,
      amount: 50,
      sourceType: "lesson_complete",
      sourceId: lesson.id,
      idempotencyKey: `lesson-complete:${context.user.id}:${lesson.id}`,
      timezone: context.user.timezone,
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await tx.dailyActivity.upsert({
      where: {
        userId_date: { userId: context.user.id, date: today },
      },
      update: { lessonsCompleted: { increment: 1 } },
      create: {
        userId: context.user.id,
        date: today,
        lessonsCompleted: 1,
      },
    });

    return { progress, xp };
  });

  return authOk({
    lessonId: lesson.id,
    accuracy,
    correct,
    total: lesson.exercises.length,
    xpAwarded: result.xp.awarded,
    xpTotal: result.xp.xpTotal,
    level: result.xp.level,
  });
}
