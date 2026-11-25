import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { awardXp, dateKeyInTimezone, touchStreak } from "@/lib/learning/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Completes a Word Vault session. The bonus is daily-idempotent: one 25 XP
 * award per learner per local day, regardless of how many sessions are opened.
 */
export async function POST() {
  const context = await getSessionContext();
  if (!context) return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  if (!prisma) return authError("Database belum dikonfigurasi.", 503, "SERVICE_UNAVAILABLE");

  const todayKey = dateKeyInTimezone(new Date(), context.user.timezone);
  const activityDate = new Date(`${todayKey}T00:00:00.000Z`);

  const result = await prisma.$transaction(async (tx) => {
    const xp = await awardXp(tx, {
      userId: context.user.id,
      amount: 25,
      sourceType: "story_vault",
      idempotencyKey: `story-vault:${todayKey}`,
      timezone: context.user.timezone,
    });
    const streak = await touchStreak(tx, context.user.id, context.user.timezone);
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId: context.user.id, date: activityDate } },
      update: { reviewsCompleted: { increment: 1 } },
      create: { userId: context.user.id, date: activityDate, reviewsCompleted: 1 },
    });
    return { ...xp, streak: streak.streakCurrent };
  });

  return authOk({
    xpAwarded: result.awarded,
    alreadyAwarded: result.alreadyAwarded,
    xpTotal: result.xpTotal,
    level: result.level,
    streak: result.streak,
  });
}
