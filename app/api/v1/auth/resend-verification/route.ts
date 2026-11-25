import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authError, authOk } from "@/lib/api/auth-response";
import { getSessionContext } from "@/lib/auth/session";
import { issueEmailVerification } from "@/lib/auth/account";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { logAuthEvent } from "@/lib/auth/request";

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

  if (context.user.emailVerifiedAt) {
    return authOk({ sent: false, message: "Email sudah terverifikasi." });
  }

  const limit = checkRateLimit(`resend:${context.user.id}`, 3, 60 * 60 * 1000);
  if (!limit.allowed) {
    return authError(
      "Terlalu banyak permintaan verifikasi. Coba lagi nanti.",
      429,
      "RATE_LIMITED",
    );
  }

  const result = await issueEmailVerification({
    id: context.user.id,
    name: context.user.name,
    email: context.user.email,
  });
  await logAuthEvent({
    userId: context.user.id,
    event: "email_verification_sent",
    request,
    metadata: { delivered: result.delivered },
  });

  return authOk({
    sent: result.delivered || process.env.NODE_ENV !== "production",
    ...(process.env.NODE_ENV !== "production"
      ? { devUrl: result.devUrl }
      : {}),
  });
}
