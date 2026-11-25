import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk, firstZodMessage } from "@/lib/api/auth-response";
import { getSessionContext, revokeAllSessions } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ChangePasswordSchema } from "@/lib/auth/validation";
import { passwordChangedEmail, sendEmail } from "@/lib/auth/email";
import { logAuthEvent } from "@/lib/auth/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  if (!context.user.emailVerifiedAt) {
    return authError(
      "Verifikasi email terlebih dahulu untuk mengubah password.",
      403,
      "EMAIL_NOT_VERIFIED",
    );
  }

  if (!prisma) {
    return authError(
      "Database belum dikonfigurasi.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      firstZodMessage(parsed.error),
      400,
      "VALIDATION_ERROR",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: context.user.id },
  });
  if (!user?.passwordHash) {
    return authError(
      "Akun ini belum memiliki password. Gunakan alur lupa password.",
      400,
      "USE_RESET_PASSWORD",
    );
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return authError(
      "Password saat ini salah.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  if (await verifyPassword(parsed.data.password, user.passwordHash)) {
    return authError(
      "Password baru harus berbeda dari password sebelumnya.",
      400,
      "VALIDATION_ERROR",
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await revokeAllSessions(user.id, context.sessionId);
  await logAuthEvent({
    userId: user.id,
    event: "password_changed",
    request,
  });

  try {
    const template = passwordChangedEmail(user.name);
    await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  } catch (error) {
    console.error("[auth] failed to send password changed email", error);
  }

  return authOk({ message: "Password berhasil diperbarui." });
}
