import { NextRequest } from "next/server";
import { authError, authOk } from "@/lib/api/auth-response";
import {
  clearSessionCookie,
  getSessionContext,
  revokeAllSessions,
} from "@/lib/auth/session";
import { logAuthEvent } from "@/lib/auth/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const context = await getSessionContext();
  if (!context) {
    return authError("Sesi tidak ditemukan.", 401, "UNAUTHORIZED");
  }

  await revokeAllSessions(context.user.id);
  await clearSessionCookie();
  await logAuthEvent({
    userId: context.user.id,
    event: "logout_all",
    request,
  });

  return authOk({ loggedOutAll: true });
}
