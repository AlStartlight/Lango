import type { Prisma } from "@/lib/generated/prisma/client";

export const DAILY_XP_CAP = 500;

export function dateKeyInTimezone(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function previousDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function activityDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function levelFromXp(xpTotal: number): number {
  return Math.min(50, Math.floor(xpTotal / 100) + 1);
}

export async function touchStreak(
  tx: Prisma.TransactionClient,
  userId: string,
  timezone: string,
): Promise<{ streakCurrent: number; streakLongest: number }> {
  const now = new Date();
  const today = dateKeyInTimezone(now, timezone);
  const yesterday = previousDateKey(today);

  const stats = await tx.userStats.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const lastKey = stats.lastActivityDate
    ? dateKeyInTimezone(stats.lastActivityDate, timezone)
    : null;

  if (lastKey === today) {
    return {
      streakCurrent: stats.streakCurrent,
      streakLongest: stats.streakLongest,
    };
  }

  const nextStreak = lastKey === yesterday ? stats.streakCurrent + 1 : 1;
  const longest = Math.max(stats.streakLongest, nextStreak);

  await tx.userStats.update({
    where: { userId },
    data: {
      streakCurrent: nextStreak,
      streakLongest: longest,
      lastActivityDate: now,
    },
  });
  await tx.user.update({
    where: { id: userId },
    data: { streakDays: nextStreak },
  });

  return { streakCurrent: nextStreak, streakLongest: longest };
}

export async function awardXp(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    amount: number;
    sourceType: string;
    sourceId?: string;
    idempotencyKey: string;
    timezone: string;
  },
): Promise<{
  awarded: number;
  xpTotal: number;
  level: number;
  alreadyAwarded: boolean;
}> {
  if (input.amount <= 0) {
    const stats = await tx.userStats.upsert({
      where: { userId: input.userId },
      update: {},
      create: { userId: input.userId },
    });
    return {
      awarded: 0,
      xpTotal: stats.xpTotal,
      level: stats.level,
      alreadyAwarded: false,
    };
  }

  const existing = await tx.xpEvent.findFirst({
    where: {
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
    },
  });
  if (existing) {
    const stats = await tx.userStats.findUnique({
      where: { userId: input.userId },
    });
    return {
      awarded: 0,
      xpTotal: stats?.xpTotal ?? 0,
      level: stats?.level ?? 1,
      alreadyAwarded: true,
    };
  }

  const stats = await tx.userStats.upsert({
    where: { userId: input.userId },
    update: {},
    create: { userId: input.userId },
  });

  const today = dateKeyInTimezone(new Date(), input.timezone);
  const dailyKey = stats.dailyXpDate
    ? dateKeyInTimezone(stats.dailyXpDate, input.timezone)
    : null;
  const dailyXp = dailyKey === today ? stats.dailyXp : 0;
  const awarded = Math.min(
    input.amount,
    Math.max(0, DAILY_XP_CAP - dailyXp),
  );

  if (awarded <= 0) {
    return {
      awarded: 0,
      xpTotal: stats.xpTotal,
      level: stats.level,
      alreadyAwarded: false,
    };
  }

  const xpTotal = stats.xpTotal + awarded;
  const level = levelFromXp(xpTotal);

  await tx.xpEvent.create({
    data: {
      userId: input.userId,
      amount: awarded,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      idempotencyKey: input.idempotencyKey,
    },
  });

  await tx.userStats.update({
    where: { userId: input.userId },
    data: {
      xpTotal,
      level,
      dailyXp: dailyXp + awarded,
      dailyXpDate: activityDate(today),
    },
  });

  await tx.user.update({
    where: { id: input.userId },
    data: { xpPoints: xpTotal, level },
  });

  await tx.dailyActivity.upsert({
    where: {
      userId_date: {
        userId: input.userId,
        date: activityDate(today),
      },
    },
    update: {
      xp: { increment: awarded },
    },
    create: {
      userId: input.userId,
      date: activityDate(today),
      xp: awarded,
    },
  });

  return { awarded, xpTotal, level, alreadyAwarded: false };
}
