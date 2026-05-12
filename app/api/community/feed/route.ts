import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, isMockMode } from "@/lib/api";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("community");
    return apiResponse(data);
  }

  const [challenge, groups, topUsers] = await Promise.all([
    prisma.globalChallenge.findFirst({
      where: { isActive: true },
      include: { userProgress: true },
    }),
    prisma.studyGroup.findMany({
      include: { members: true },
      orderBy: { memberCount: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { xpPoints: "desc" },
      take: 10,
    }),
  ]);

  return apiResponse({
    globalChallenge: challenge
      ? {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          isActive: challenge.isActive,
          progressPercent: challenge.userProgress[0]?.progressPercent ?? 0,
          participantCount: challenge.participantCount,
        }
      : {
          id: "gc-001",
          title: "Weekly Challenge",
          description: "Practice daily to earn XP.",
          isActive: true,
          progressPercent: 0,
          participantCount: 0,
        },
    weeklyLeaderboard: topUsers.map((u, i) => ({
      rank: i + 1,
      username: u.name,
      xp: u.xpPoints,
    })),
    studyGroups: groups.map((g) => ({
      id: g.id,
      icon: g.icon,
      iconBg: g.iconBg,
      iconColor: g.iconColor,
      title: g.title,
      description: g.description,
      memberCount: g.memberCount,
    })),
  });
}
