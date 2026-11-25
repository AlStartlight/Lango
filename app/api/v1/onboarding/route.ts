import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { OnboardingSchema, resolveOnboardingLevel } from "@/lib/auth/validation";
import { toPublicUser } from "@/lib/auth/account";
import { logAuthEvent } from "@/lib/auth/request";
import { writeLocaleCookie } from "@/lib/i18n/cookie";
import { isUiLocale } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const body = await request.json().catch(() => null);
  const parsed = OnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      firstZodMessage(parsed.error),
      400,
      "VALIDATION_ERROR",
    );
  }

  const input = parsed.data;
  const level = resolveOnboardingLevel(input);
  const uiLocale = input.uiLocale ?? (isUiLocale(context.user.uiLocale) ? context.user.uiLocale : "en");

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: context.user.id },
      data: {
        targetLanguage: input.targetLanguage,
        activeLanguageCode: input.targetLanguage,
        learningLanguage: input.targetLanguage,
        curriculumLevel: level,
        cefrLevel: input.cefrLevel ?? (level.startsWith("A") || level.startsWith("B") || level.startsWith("C") ? level : "A1"),
        uiLocale,
        dailyGoalMinutes: input.dailyGoalMinutes,
        timezone: input.timezone,
        onboardingCompletedAt: new Date(),
      },
    });

    await tx.userStats.upsert({
      where: { userId: updated.id },
      update: {},
      create: { userId: updated.id },
    });

    await tx.learningSettings.upsert({
      where: { userId: updated.id },
      update: {
        targetLanguage: input.targetLanguage,
        dailyGoalMinutes: input.dailyGoalMinutes,
      },
      create: {
        userId: updated.id,
        targetLanguage: input.targetLanguage,
        dailyGoalMinutes: input.dailyGoalMinutes,
        tutorVoice: "Default",
      },
    });

    await tx.userLanguageProfile.updateMany({
      where: { userId: updated.id, isActive: true },
      data: { isActive: false },
    });
    await tx.userLanguageProfile.upsert({
      where: {
        userId_languageCode: {
          userId: updated.id,
          languageCode: input.targetLanguage,
        },
      },
      update: {
        isActive: true,
        activeLevelCode: level,
        lastActiveAt: new Date(),
      },
      create: {
        userId: updated.id,
        languageCode: input.targetLanguage,
        activeLevelCode: level,
        isActive: true,
        startedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    return updated;
  });

  await writeLocaleCookie(uiLocale);

  await logAuthEvent({
    userId: user.id,
    event: "onboarding_completed",
    request,
    metadata: {
      targetLanguage: input.targetLanguage,
      curriculumLevel: level,
      uiLocale,
      dailyGoalMinutes: input.dailyGoalMinutes,
    },
  });

  return authOk({ user: toPublicUser(user) });
}
