import { prisma } from "@/lib/prisma";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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

  const [progress, stats, dueReview] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: context.user.id },
      select: {
        lessonId: true,
        status: true,
        bestAccuracy: true,
        lastAccuracy: true,
        attemptCount: true,
        completedAt: true,
        masteredAt: true,
      },
    }),
    prisma.userStats.findUnique({ where: { userId: context.user.id } }),
    prisma.spacedReviewItem.count({
      where: {
        userId: context.user.id,
        status: "active",
        dueAt: { lte: new Date() },
      },
    }),
  ]);

  const completedLessonIds = progress
    .filter((item) => item.status === "completed" || item.status === "mastered")
    .map((item) => item.lessonId);

  return authOk({
    completedLessonIds,
    lessonProgress: progress.map((item) => ({
      ...item,
      completedAt: item.completedAt?.toISOString() ?? null,
      masteredAt: item.masteredAt?.toISOString() ?? null,
    })),
    dueReview,
    stats: {
      xpTotal: stats?.xpTotal ?? 0,
      level: stats?.level ?? 1,
      streakCurrent: stats?.streakCurrent ?? 0,
      streakLongest: stats?.streakLongest ?? 0,
      hearts: stats?.hearts ?? 5,
    },
  });
}
