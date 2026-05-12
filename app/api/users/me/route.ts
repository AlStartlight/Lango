import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, apiError, isMockMode } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("profile");
    return apiResponse(data);
  }

  const authUser = await getAuthUser(request);
  if (!authUser) return apiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      fluencies: true,
      achievements: { include: { achievement: true } },
      activities: { orderBy: { date: "desc" }, take: 28 },
    },
  });

  if (!user) {
    return apiError("User not found", 404);
  }

  const activityHeatmap = user.activities.map((a) => a.color);
  while (activityHeatmap.length < 28) {
    activityHeatmap.push("#e2e2e2");
  }

  return apiResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      nativeLanguage: user.nativeLanguage,
      learningLanguage: user.learningLanguage,
      dailyGoalMinutes: user.dailyGoalMinutes,
      streakDays: user.streakDays,
      createdAt: user.createdAt.toISOString(),
    },
    badge: user.badge,
    xpPoints: user.xpPoints,
    globalRank: user.globalRank,
    fluencyBreakdown: user.fluencies.map((f) => ({
      language: f.language,
      percent: f.percent,
    })),
    pronunciationAccuracyPercent: user.pronunciationAccuracyPercent,
    pronunciationTrendPercent: user.pronunciationTrendPercent,
    activityHeatmap,
    achievements: user.achievements.map((ua) => ({
      id: ua.achievement.id,
      icon: ua.achievement.icon,
      iconBg: ua.achievement.iconBg,
      iconColor: ua.achievement.iconColor,
      title: ua.achievement.title,
      description: ua.achievement.description,
    })),
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (isMockMode() || !prisma) {
    return apiResponse({ message: "Profile updated (mock)" });
  }

  const authUser = await getAuthUser(request);
  if (!authUser) return apiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) {
    return apiError("User not found", 404);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name ?? undefined,
      avatarUrl: body.avatarUrl ?? undefined,
      nativeLanguage: body.nativeLanguage ?? undefined,
      learningLanguage: body.learningLanguage ?? undefined,
      dailyGoalMinutes: body.dailyGoalMinutes ?? undefined,
    },
  });

  return apiResponse({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatarUrl: updated.avatarUrl,
    nativeLanguage: updated.nativeLanguage,
    learningLanguage: updated.learningLanguage,
    dailyGoalMinutes: updated.dailyGoalMinutes,
  });
}
