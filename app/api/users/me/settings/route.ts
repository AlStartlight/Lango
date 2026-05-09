import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMockData, apiResponse, apiError, isMockMode } from "@/lib/api";
import { SettingsUpdateSchema } from "@/lib/schemas";

export async function GET() {
  if (isMockMode() || !prisma) {
    const data = await fetchMockData<Record<string, unknown>>("settings");
    return apiResponse(data);
  }

  const user = await prisma.user.findFirst({
    include: {
      settings: true,
      learning: true,
      notifications: true,
      app: true,
    },
  });

  if (!user) {
    return apiError("User not found", 404);
  }

  return apiResponse({
    user: {
      id: user.id,
      name: user.settings?.name ?? user.name,
      email: user.settings?.email ?? user.email,
      avatarUrl: user.settings?.avatarUrl ?? user.avatarUrl,
    },
    level: user.level,
    levelLabel: user.levelLabel,
    levelProgressPercent: user.levelProgressPercent,
    isPro: user.isPro,
    learning: {
      dailyGoalMinutes: user.learning?.dailyGoalMinutes ?? user.dailyGoalMinutes,
      targetLanguage: user.learning?.targetLanguage ?? user.learningLanguage,
      tutorVoice: user.learning?.tutorVoice ?? "Default",
    },
    notifications: {
      lessonReminders: user.notifications?.lessonReminders ?? true,
      streakAlerts: user.notifications?.streakAlerts ?? true,
      communityMessages: user.notifications?.communityMessages ?? false,
    },
    app: {
      darkMode: user.app?.darkMode ?? false,
      appLanguage: user.app?.appLanguage ?? "English (US)",
    },
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = SettingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid settings: " + parsed.error.message);
  }

  if (isMockMode() || !prisma) {
    return apiResponse({ message: "Settings updated (mock)" });
  }

  const user = await prisma.user.findFirst();
  if (!user) {
    return apiError("User not found", 404);
  }

  if (parsed.data.learning) {
    const { dailyGoalMinutes, targetLanguage, tutorVoice } = parsed.data.learning;
    await prisma.learningSettings.upsert({
      where: { userId: user.id },
      update: parsed.data.learning,
      create: {
        userId: user.id,
        dailyGoalMinutes: dailyGoalMinutes ?? user.dailyGoalMinutes,
        targetLanguage: targetLanguage ?? user.learningLanguage,
        tutorVoice: tutorVoice ?? "Default",
      },
    });
  }

  if (parsed.data.notifications) {
    await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: parsed.data.notifications,
      create: {
        userId: user.id,
        lessonReminders: parsed.data.notifications.lessonReminders ?? true,
        streakAlerts: parsed.data.notifications.streakAlerts ?? true,
        communityMessages: parsed.data.notifications.communityMessages ?? false,
      },
    });
  }

  if (parsed.data.app) {
    await prisma.appSettings.upsert({
      where: { userId: user.id },
      update: parsed.data.app,
      create: {
        userId: user.id,
        darkMode: parsed.data.app.darkMode ?? false,
        appLanguage: parsed.data.app.appLanguage ?? "English (US)",
      },
    });
  }

  return apiResponse({ message: "Settings updated" });
}
