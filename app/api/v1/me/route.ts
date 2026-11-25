import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { ProfileUpdateSchema } from "@/lib/auth/validation";
import { toPublicUser } from "@/lib/auth/account";
import { writeLocaleCookie } from "@/lib/i18n/cookie";
import {
  defaultLevelForLanguage,
  frameworkForLanguage,
  isLevelForLanguage,
  normalizeLanguageCode,
  type CurriculumLevelCode,
  type LanguageCode,
} from "@/lib/i18n/locales";

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

  const stats = await prisma.userStats.findUnique({
    where: { userId: context.user.id },
  });

  return authOk({
    user: context.user,
    stats: stats
      ? {
          xpTotal: stats.xpTotal,
          level: stats.level,
          streakCurrent: stats.streakCurrent,
          streakLongest: stats.streakLongest,
          hearts: stats.hearts,
          lastActivityDate: stats.lastActivityDate?.toISOString() ?? null,
        }
      : null,
  });
}

export async function PATCH(request: NextRequest) {
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
  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      firstZodMessage(parsed.error),
      400,
      "VALIDATION_ERROR",
    );
  }

  const data = parsed.data;
  const nextTarget: LanguageCode | undefined = data.targetLanguage;
  let nextLevel = data.curriculumLevel;

  if (nextLevel) {
    const effectiveTarget =
      nextTarget ?? normalizeLanguageCode(context.user.targetLanguage);
    if (!isLevelForLanguage(effectiveTarget, nextLevel)) {
      return authError(
        `Level ${nextLevel} tidak cocok dengan framework ${frameworkForLanguage(effectiveTarget)}.`,
        400,
        "INVALID_LEVEL_FOR_FRAMEWORK",
      );
    }
  }

  if (nextTarget) {
    const currentLevel = context.user.curriculumLevel;
    if (
      !nextLevel &&
      currentLevel &&
      isLevelForLanguage(nextTarget, currentLevel)
    ) {
      nextLevel = currentLevel as CurriculumLevelCode;
    }
    if (!nextLevel) {
      nextLevel = defaultLevelForLanguage(nextTarget);
    }
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: context.user.id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
          ...(data.nativeLanguage ? { nativeLanguage: data.nativeLanguage } : {}),
          ...(data.uiLocale ? { uiLocale: data.uiLocale } : {}),
          ...(nextTarget
            ? {
                targetLanguage: nextTarget,
                activeLanguageCode: nextTarget,
                learningLanguage: nextTarget,
              }
            : {}),
          ...(nextLevel ? { curriculumLevel: nextLevel } : {}),
          ...(data.explanationLocale
            ? { explanationLocale: data.explanationLocale }
            : {}),
          ...(data.cefrLevel ? { cefrLevel: data.cefrLevel } : {}),
          ...(data.dailyGoalMinutes
            ? { dailyGoalMinutes: data.dailyGoalMinutes }
            : {}),
          ...(data.timezone ? { timezone: data.timezone } : {}),
        },
      });

      if (nextTarget) {
        await tx.userLanguageProfile.updateMany({
          where: { userId: updated.id, isActive: true, languageCode: { not: nextTarget } },
          data: { isActive: false },
        });
        await tx.userLanguageProfile.upsert({
          where: {
            userId_languageCode: {
              userId: updated.id,
              languageCode: nextTarget,
            },
          },
          update: {
            isActive: true,
            activeLevelCode: nextLevel ?? undefined,
            lastActiveAt: new Date(),
          },
          create: {
            userId: updated.id,
            languageCode: nextTarget,
            activeLevelCode: nextLevel ?? defaultLevelForLanguage(nextTarget),
            isActive: true,
            startedAt: new Date(),
            lastActiveAt: new Date(),
          },
        });
      }

      if (data.dailyGoalMinutes || nextTarget) {
        await tx.learningSettings.upsert({
          where: { userId: updated.id },
          update: {
            ...(data.dailyGoalMinutes
              ? { dailyGoalMinutes: data.dailyGoalMinutes }
              : {}),
            ...(nextTarget ? { targetLanguage: nextTarget } : {}),
          },
          create: {
            userId: updated.id,
            dailyGoalMinutes: updated.dailyGoalMinutes,
            targetLanguage: updated.targetLanguage,
            tutorVoice: "Default",
          },
        });
      }

      return updated;
    });

    if (data.uiLocale) {
      // Persist the preference before responding so the client can navigate
      // only after the server has confirmed it.
      await writeLocaleCookie(data.uiLocale);
    }

    return authOk({ user: toPublicUser(user) });
  } catch (error) {
    console.error("[me] failed to update profile", error);
    return authError(
      "Gagal menyimpan preferensi. Coba lagi.",
      500,
      "UPDATE_FAILED",
    );
  }
}
