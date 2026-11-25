import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { NumberAttemptSchema } from "@/lib/learning/schemas";
import { getNumberWord } from "@/components/editor/number-name/number-data";
import { awardXp, touchStreak } from "@/lib/learning/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }
  if (!prisma) {
    return authError("Database belum dikonfigurasi.", 503, "SERVICE_UNAVAILABLE");
  }

  const url = new URL(request.url);
  const languageCode =
    url.searchParams.get("language") ?? context.user.targetLanguage;
  if (!NumberAttemptSchema.shape.languageCode.safeParse(languageCode).success) {
    return authError("Kode bahasa tidak dikenal.", 400, "INVALID_LANGUAGE");
  }

  const where = { userId: context.user.id, languageCode };
  const [total, correct, byPhase, distinct, recent] = await Promise.all([
    prisma.numberAttempt.count({ where }),
    prisma.numberAttempt.count({ where: { ...where, isCorrect: true } }),
    prisma.numberAttempt.groupBy({
      by: ["phase"],
      where,
      _count: { _all: true },
      _sum: { xpAwarded: true },
    }),
    prisma.numberAttempt.findMany({
      where,
      distinct: ["value"],
      select: { value: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.numberAttempt.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return authOk({
    languageCode,
    totalAttempts: total,
    correctAttempts: correct,
    accuracyPercent: total > 0 ? Math.round((correct / total) * 100) : 0,
    distinctNumbers: distinct.length,
    phases: byPhase.map((row) => ({
      phase: row.phase,
      attempts: row._count._all,
      xp: row._sum.xpAwarded ?? 0,
    })),
    lastAttemptAt: recent?.createdAt.toISOString() ?? null,
  });
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

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

  const limit = checkRateLimit(
    `number-attempt:${context.user.id}`,
    120,
    60 * 1000,
  );
  if (!limit.allowed) {
    return authError(
      "Terlalu banyak jawaban dalam waktu singkat.",
      429,
      "RATE_LIMITED",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = NumberAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      firstZodMessage(parsed.error),
      400,
      "VALIDATION_ERROR",
    );
  }

  const input = parsed.data;
  const word = getNumberWord(input.value, input.languageCode);
  const answerAsString =
    typeof input.answer === "number"
      ? String(input.answer)
      : normalize(input.answer);

  const correct =
    input.phase === "spell"
      ? normalize(word) === answerAsString
      : String(input.value) === answerAsString;

  const existing = await prisma.numberAttempt.findUnique({
    where: {
      userId_clientAttemptId: {
        userId: context.user.id,
        clientAttemptId: input.clientAttemptId,
      },
    },
  });

  if (existing) {
    const stats = await prisma.userStats.findUnique({
      where: { userId: context.user.id },
    });
    return authOk({
      correct: existing.isCorrect,
      word,
      xpAwarded: existing.xpAwarded,
      stats: {
        xpTotal: stats?.xpTotal ?? 0,
        level: stats?.level ?? 1,
      },
      idempotent: true,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const xp = await awardXp(tx, {
      userId: context.user.id,
      amount: correct ? 10 : 0,
      sourceType: "number_attempt",
      sourceId: `${input.languageCode}:${input.value}`,
      idempotencyKey: `number-attempt:${context.user.id}:${input.clientAttemptId}`,
      timezone: context.user.timezone,
    });

    await tx.numberAttempt.create({
      data: {
        clientAttemptId: input.clientAttemptId,
        userId: context.user.id,
        languageCode: input.languageCode,
        value: input.value,
        phase: input.phase,
        isCorrect: correct,
        timeMs: input.timeSpentMs,
        xpAwarded: xp.awarded,
      },
    });

    const conceptKey = `number.${input.languageCode}.${input.value}`;
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
          sourceId: conceptKey,
        },
        create: {
          userId: context.user.id,
          moduleId: "number-name",
          languageCode: input.languageCode,
          conceptKey,
          sourceType: "number",
          sourceId: conceptKey,
          intervalDays: 1,
          dueAt: new Date(Date.now() + 86_400_000),
          lapses: 1,
          priority: "high",
        },
      });
    }

    await touchStreak(tx, context.user.id, context.user.timezone);
    const stats = await tx.userStats.findUnique({
      where: { userId: context.user.id },
    });

    return {
      xpAwarded: xp.awarded,
      stats: {
        xpTotal: stats?.xpTotal ?? 0,
        level: stats?.level ?? 1,
        streakCurrent: stats?.streakCurrent ?? 0,
      },
    };
  });

  return authOk({
    correct,
    word,
    xpAwarded: result.xpAwarded,
    stats: result.stats,
  });
}
