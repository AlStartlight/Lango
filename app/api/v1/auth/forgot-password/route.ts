import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { ForgotPasswordSchema } from "@/lib/auth/validation";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, logAuthEvent } from "@/lib/auth/request";
import { issuePasswordReset } from "@/lib/auth/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_MESSAGE =
  "Jika email terdaftar, tautan reset telah dikirim. Periksa inbox dan folder spam.";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`forgot:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return authError(
      "Terlalu banyak permintaan. Coba lagi nanti.",
      429,
      "RATE_LIMITED",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ForgotPasswordSchema.safeParse(body);
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

  const { email } = parsed.data;
  const emailLimit = checkRateLimit(`forgot:email:${email}`, 3, 60 * 60 * 1000);

  // Always return the same response, even when the email does not exist or is
  // rate-limited. This prevents account enumeration.
  if (!emailLimit.allowed) {
    return authOk({ message: GENERIC_MESSAGE });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    try {
      await issuePasswordReset(user, request);
      await logAuthEvent({
        userId: user.id,
        event: "password_reset_requested",
        request,
      });
    } catch (error) {
      console.error("[auth] failed to send password reset email", error);
    }
  }

  return authOk({ message: GENERIC_MESSAGE });
}
