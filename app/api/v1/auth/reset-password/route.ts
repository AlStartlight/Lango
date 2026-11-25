import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ResetPasswordSchema } from "@/lib/auth/validation";
import { hashToken } from "@/lib/auth/tokens";
import { passwordChangedEmail, sendEmail } from "@/lib/auth/email";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, logAuthEvent } from "@/lib/auth/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`reset:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return authError(
      "Terlalu banyak permintaan. Coba lagi nanti.",
      429,
      "RATE_LIMITED",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ResetPasswordSchema.safeParse(body);
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

  const { token, password } = parsed.data;
  const now = new Date();

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= now
  ) {
    return authError(
      "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.",
      400,
      "INVALID_RESET_TOKEN",
    );
  }

  if (
    resetToken.user.passwordHash &&
    (await verifyPassword(password, resetToken.user.passwordHash))
  ) {
    return authError(
      "Password baru harus berbeda dari password sebelumnya.",
      400,
      "VALIDATION_ERROR",
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        emailVerifiedAt: resetToken.user.emailVerifiedAt ?? now,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now },
    }),
    prisma.session.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);

  await logAuthEvent({
    userId: resetToken.userId,
    event: "password_reset_completed",
    request,
  });

  try {
    const template = passwordChangedEmail(resetToken.user.name);
    await sendEmail({
      to: resetToken.user.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  } catch (error) {
    console.error("[auth] failed to send password changed email", error);
  }

  return authOk({
    message: "Password berhasil diperbarui. Silakan masuk kembali.",
  });
}
