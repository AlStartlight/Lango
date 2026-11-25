import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { verifyPassword } from "@/lib/auth/password";
import { LoginSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import { toPublicUser } from "@/lib/auth/account";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, logAuthEvent } from "@/lib/auth/request";
import { writeLocaleCookie } from "@/lib/i18n/cookie";
import { isUiLocale } from "@/lib/i18n/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A valid bcrypt hash used only to equalize timing for unknown accounts.
const DUMMY_HASH =
  "$2b$12$XCCOVNJAL/YhDpCWoGPIJepWhc342ptfnWg0PwRaCMfCMsgfMhgn6";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return authError(
      "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.",
      429,
      "RATE_LIMITED",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
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

  const { email, password, rememberMe } = parsed.data;
  const accountLimit = checkRateLimit(
    `login:account:${email}`,
    5,
    15 * 60 * 1000,
  );
  if (!accountLimit.allowed) {
    return authError(
      "Terlalu banyak percobaan masuk untuk akun ini. Coba lagi nanti.",
      429,
      "RATE_LIMITED",
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = user?.passwordHash ?? DUMMY_HASH;
  const valid = await verifyPassword(password, passwordHash);

  if (!user || !user.passwordHash || !valid) {
    await logAuthEvent({
      userId: user?.id ?? null,
      event: "login_failed",
      request,
    });
    return authError(
      "Email atau password salah.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  resetRateLimit(`login:account:${email}`);
  let session: { token: string; expiresAt: Date };
  try {
    session = await createSession(user.id, rememberMe);
  } catch (error) {
    console.error("[auth] failed to create session", {
      userId: user.id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return authError(
      "Layanan masuk sedang tidak tersedia. Coba lagi sebentar.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }
  if (isUiLocale(user.uiLocale)) {
    await writeLocaleCookie(user.uiLocale);
  }
  await logAuthEvent({ userId: user.id, event: "login", request });

  return authOk({
    user: toPublicUser(user),
    sessionExpiresAt: session.expiresAt.toISOString(),
  });
}
