import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, isMockMode } from "@/lib/api";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("home");
    return apiResponse(data);
  }

  // In production: aggregate from DB
  const user = await prisma.user.findFirst();
  const challenge = await prisma.dailyChallenge.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return apiResponse({
    momentum: {
      userName: user?.name ?? "Learner",
      streakDays: user?.streakDays ?? 0,
      streakLabel: user && user.streakDays > 0 ? "Unstoppable" : "Start your streak!",
      dailyGoalPercent: Math.min(
        Math.round((user?.dailyGoalMinutes ?? 15) / 15 * 100),
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
      proficiencyPercent: user?.levelProgressPercent ?? 0,
      label: "Keep going!",
    },
    leaderboard: [
      { rank: 1, name: "Learner", badge: "Active", xp: user?.xpPoints ?? 0, isCurrentUser: true },
    ],
    leagueLabel: "Bronze League",
  });
}
