import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { hashPassword } from "@/lib/auth/password";
import { RegisterSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import { issueEmailVerification, toPublicUser } from "@/lib/auth/account";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, logAuthEvent } from "@/lib/auth/request";
import { writeLocaleCookie } from "@/lib/i18n/cookie";
import { isUiLocale } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return authError(
      "Terlalu banyak percobaan. Coba lagi nanti.",
      429,
      "RATE_LIMITED",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      firstZodMessage(parsed.error),
      400,
      "VALIDATION_ERROR",
    );
  }

  if (!prisma) {
    return authError(
      "Database belum dikonfigurasi.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  const { name, email, password, rememberMe } = parsed.data;
  const uiLocale = parsed.data.uiLocale ?? "en";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await logAuthEvent({
      userId: existing.id,
      event: "register_conflict",
      request,
    });
    return authError(
      "Tidak dapat membuat akun dengan email ini. Coba masuk atau gunakan lupa password.",
      409,
      "CONFLICT",
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        name,
        passwordHash,
        nativeLanguage: "id",
        learningLanguage: "en",
        targetLanguage: "en",
        activeLanguageCode: "en",
        uiLocale,
        explanationLocale: uiLocale === "en" || uiLocale === "id" ? uiLocale : "en",
        curriculumLevel: "A1",
        cefrLevel: "A1",
        timezone: "Asia/Jakarta",
        role: "learner",
      },
    });

    await tx.userStats.create({ data: { userId: created.id } });
    await tx.userSettings.create({
      data: { userId: created.id, name: created.name, email: created.email },
    });
    await tx.learningSettings.create({
      data: {
        userId: created.id,
        dailyGoalMinutes: created.dailyGoalMinutes,
        targetLanguage: created.targetLanguage,
        tutorVoice: "Default",
      },
    });
    await tx.notificationSettings.create({ data: { userId: created.id } });
    await tx.appSettings.create({ data: { userId: created.id } });

    return created;
  });

  const session = await createSession(user.id, rememberMe);
  if (isUiLocale(uiLocale)) await writeLocaleCookie(uiLocale);
  await logAuthEvent({ userId: user.id, event: "register", request });

  let emailVerificationSent = false;
  try {
    const result = await issueEmailVerification(user);
    emailVerificationSent =
      result.delivered || process.env.NODE_ENV !== "production";
    await logAuthEvent({
      userId: user.id,
      event: "email_verification_sent",
      request,
      metadata: { delivered: result.delivered },
    });
  } catch (error) {
    console.error("[auth] failed to send verification email", error);
  }

  return authOk(
    {
      user: toPublicUser(user),
      sessionExpiresAt: session.expiresAt.toISOString(),
      emailVerificationSent,
    },
    201,
  );
}
