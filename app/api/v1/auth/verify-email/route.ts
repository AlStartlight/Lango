import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { VerifyEmailSchema } from "@/lib/auth/validation";
import { hashToken } from "@/lib/auth/tokens";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, logAuthEvent } from "@/lib/auth/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`verify:ip:${ip}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) {
    return authError(
      "Terlalu banyak permintaan. Coba lagi nanti.",
      429,
      "RATE_LIMITED",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = VerifyEmailSchema.safeParse(body);
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

  const now = new Date();
  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
    include: { user: true },
  });

  if (!token || token.usedAt || token.expiresAt <= now) {
    return authError(
      "Tautan verifikasi tidak valid atau sudah kedaluwarsa. Minta tautan baru.",
      400,
      "INVALID_VERIFICATION_TOKEN",
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { emailVerifiedAt: token.user.emailVerifiedAt ?? now },
    }),
    prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    }),
  ]);

  await logAuthEvent({
    userId: token.userId,
    event: "email_verified",
    request,
  });

  return authOk({ verified: true, email: token.user.email });
}
