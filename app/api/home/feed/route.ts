import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, isMockMode } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("home");
    return apiResponse(data);
  }

  // In production: aggregate from DB
  const [authUser, topUsers, challenge] = await Promise.all([
    getAuthUser(request),
    prisma.user.findMany({ orderBy: { xpPoints: "desc" }, take: 10 }),
    prisma.dailyChallenge.findFirst({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return apiResponse({
    momentum: {
      userName: authUser?.name ?? "Learner",
      streakDays: authUser?.streakDays ?? 0,
      streakLabel: authUser && authUser.streakDays > 0 ? "Unstoppable" : "Start your streak!",
      dailyGoalPercent: Math.min(
        Math.round((authUser?.dailyGoalMinutes ?? 15) / 15 * 100),
        100
      ),
    },
    dailyChallenge: challenge ?? {
      id: "challenge-001",
      title: "Daily Practice",
      description: "Complete your daily exercises.",
      isNew: true,
    },
    weeklyStats: {
      proficiencyPercent: authUser?.levelProgressPercent ?? 0,
      label: "Keep going!",
    },
    leaderboard: topUsers.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      badge: u.badge,
      xp: u.xpPoints,
      isCurrentUser: u.id === authUser?.id,
    })),
    leagueLabel: "Bronze League",
  });
}
